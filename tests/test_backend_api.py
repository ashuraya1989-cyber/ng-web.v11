"""
Backend API Tests for Nisha Goriel Photography Portfolio
Tests: Auth, Gallery, Settings, Contact APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "info@nishagoriel.com"
ADMIN_PASSWORD = "admin123"


class TestHealthAndPublicEndpoints:
    """Test public endpoints that don't require authentication"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data['message']}")
    
    def test_public_settings_endpoint(self):
        """Test /api/settings/public returns contact_info, button_labels, categories"""
        response = requests.get(f"{BASE_URL}/api/settings/public")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields exist
        assert "contact_info" in data, "Missing contact_info in public settings"
        assert "button_labels" in data, "Missing button_labels in public settings"
        assert "categories" in data, "Missing categories in public settings"
        
        # Verify contact_info structure
        contact_info = data["contact_info"]
        assert "location" in contact_info
        assert "email" in contact_info
        assert "hours" in contact_info
        # phone can be empty (intentionally for testing conditional hide)
        
        # Verify button_labels structure
        button_labels = data["button_labels"]
        assert "view_gallery" in button_labels
        assert "book_session" in button_labels
        
        # Verify categories structure
        categories = data["categories"]
        assert isinstance(categories, list)
        assert len(categories) >= 2  # At least wedding and pre-wedding
        for cat in categories:
            assert "id" in cat
            assert "name" in cat
            assert "slug" in cat
        
        print(f"✓ Public settings: contact_info={list(contact_info.keys())}, button_labels={list(button_labels.keys())}, categories={len(categories)}")
    
    def test_gallery_public_endpoint(self):
        """Test public gallery endpoint"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Gallery: {len(data)} images")
    
    def test_videos_public_endpoint(self):
        """Test public videos endpoint"""
        response = requests.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Videos: {len(data)} videos")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Login successful, token received")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Invalid login correctly rejected")
    
    def test_profile_without_auth(self):
        """Test profile endpoint without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/profile")
        assert response.status_code in [401, 403]
        print(f"✓ Profile correctly requires auth")
    
    def test_profile_with_auth(self):
        """Test profile endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get profile
        response = requests.get(
            f"{BASE_URL}/api/auth/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert "id" in data
        assert "name" in data
        print(f"✓ Profile retrieved: {data['email']}")


class TestSettingsAPI:
    """Test settings API endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_settings_requires_auth(self):
        """Test that /api/settings requires authentication"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code in [401, 403]
        print(f"✓ Settings correctly requires auth")
    
    def test_get_settings_with_auth(self, auth_token):
        """Test getting settings with authentication"""
        response = requests.get(
            f"{BASE_URL}/api/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        print(f"✓ Settings retrieved: {list(data.keys())}")
    
    def test_update_button_labels(self, auth_token):
        """Test updating button labels"""
        new_labels = {
            "view_gallery": "View Gallery",
            "book_session": "Book a Session",
            "book_now": "Book Now",
            "get_in_touch": "Get in Touch",
            "send_message": "Skicka meddelande"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"button_labels": new_labels}
        )
        assert response.status_code == 200
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/settings/public")
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert data["button_labels"]["view_gallery"] == "View Gallery"
        print(f"✓ Button labels updated successfully")
    
    def test_update_categories(self, auth_token):
        """Test updating categories"""
        new_categories = [
            {"id": "wedding", "name": "Wedding", "slug": "wedding"},
            {"id": "pre-wedding", "name": "Pre-Wedding", "slug": "pre-wedding"}
        ]
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"categories": new_categories}
        )
        assert response.status_code == 200
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/settings/public")
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert len(data["categories"]) >= 2
        print(f"✓ Categories updated successfully")
    
    def test_update_contact_info(self, auth_token):
        """Test updating contact info"""
        new_contact = {
            "location": "Stockholm, Sweden",
            "phone": "",  # Intentionally empty to test conditional hide
            "email": "info@nishagoriel.com",
            "hours": "Mon - Fri: 9:00 - 18:00"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"contact_info": new_contact}
        )
        assert response.status_code == 200
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/settings/public")
        assert verify_response.status_code == 200
        data = verify_response.json()
        assert data["contact_info"]["location"] == "Stockholm, Sweden"
        print(f"✓ Contact info updated successfully")


class TestContactAPI:
    """Test contact form API"""
    
    def test_submit_contact_form(self):
        """Test submitting a contact form"""
        contact_data = {
            "name": "TEST_User",
            "email": "test@example.com",
            "phone": "+46 70 123 4567",
            "booking_date": "2025-06-15",
            "venue": "Stockholm City Hall",
            "message": "This is a test message for booking inquiry."
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=contact_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_User"
        assert data["email"] == "test@example.com"
        assert "id" in data
        print(f"✓ Contact form submitted: {data['id']}")
        return data["id"]
    
    def test_get_messages_requires_auth(self):
        """Test that getting messages requires authentication"""
        response = requests.get(f"{BASE_URL}/api/contact")
        assert response.status_code in [401, 403]
        print(f"✓ Contact messages correctly requires auth")


class TestGalleryAPI:
    """Test gallery API endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_gallery_images(self):
        """Test getting all gallery images"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Gallery images: {len(data)}")
    
    def test_get_gallery_by_category(self):
        """Test filtering gallery by category"""
        response = requests.get(f"{BASE_URL}/api/gallery?category=wedding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned images should be wedding category
        for img in data:
            assert img["category"] == "wedding"
        print(f"✓ Wedding images: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
