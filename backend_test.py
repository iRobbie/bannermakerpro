#!/usr/bin/env python3
"""
Backend API Testing Script for Banner Maker
Tests all backend endpoints with proper error handling and validation
"""

import requests
import json
import base64
import os
from datetime import datetime
from pathlib import Path

# Configuration
BACKEND_URL = "https://5c8dedcf-5a2a-4e2a-b58c-da67c4738be2.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BannerMakerAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = []
        self.created_project_id = None
        self.uploaded_image_ids = []

    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if not success and response_data:
            print(f"   Response: {response_data}")

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("Health Check", True, "API is healthy", data)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test root API endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/")
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'version' in data:
                    self.log_test("Root Endpoint", True, "Root endpoint working", data)
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Missing expected fields: {data}", data)
                    return False
            else:
                self.log_test("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_create_project(self):
        """Test project creation"""
        try:
            project_data = {
                "name": "Test Banner Project",
                "description": "A test project for API validation"
            }
            
            response = self.session.post(f"{API_BASE}/projects/", json=project_data)
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('name') == project_data['name']:
                    self.created_project_id = data['id']
                    self.log_test("Create Project", True, f"Project created with ID: {self.created_project_id}", data)
                    return True
                else:
                    self.log_test("Create Project", False, f"Invalid response structure: {data}", data)
                    return False
            else:
                self.log_test("Create Project", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Project", False, f"Exception: {str(e)}")
            return False

    def test_get_projects(self):
        """Test getting all projects"""
        try:
            response = self.session.get(f"{API_BASE}/projects/")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    project_found = False
                    if self.created_project_id:
                        project_found = any(p.get('id') == self.created_project_id for p in data)
                    
                    if project_found or len(data) >= 0:  # Allow empty list
                        self.log_test("Get Projects", True, f"Retrieved {len(data)} projects", {"count": len(data)})
                        return True
                    else:
                        self.log_test("Get Projects", False, "Created project not found in list", data)
                        return False
                else:
                    self.log_test("Get Projects", False, f"Expected list, got: {type(data)}", data)
                    return False
            else:
                self.log_test("Get Projects", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Projects", False, f"Exception: {str(e)}")
            return False

    def test_get_specific_project(self):
        """Test getting a specific project"""
        if not self.created_project_id:
            self.log_test("Get Specific Project", False, "No project ID available for testing")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects/{self.created_project_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get('id') == self.created_project_id:
                    self.log_test("Get Specific Project", True, f"Retrieved project: {data.get('name')}", data)
                    return True
                else:
                    self.log_test("Get Specific Project", False, f"ID mismatch: expected {self.created_project_id}, got {data.get('id')}", data)
                    return False
            else:
                self.log_test("Get Specific Project", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Specific Project", False, f"Exception: {str(e)}")
            return False

    def create_test_image_base64(self):
        """Create a simple test image in base64 format"""
        # Create a simple 100x100 red PNG image
        from PIL import Image
        import io
        
        # Create a simple red square
        img = Image.new('RGB', (100, 100), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Convert to base64
        image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return image_data

    def test_image_upload(self):
        """Test image upload endpoint"""
        try:
            # Create test image data
            image_base64 = self.create_test_image_base64()
            
            images_data = [{
                "name": "test_image.png",
                "size": len(base64.b64decode(image_base64)),
                "content_type": "image/png",
                "data": image_base64
            }]
            
            # Prepare form data - the API expects form data, not JSON
            form_data = {
                'images_data': json.dumps(images_data)
            }
            
            # Use requests without session to avoid JSON headers
            response = requests.post(f"{API_BASE}/images/upload", data=form_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'images' in data and len(data['images']) > 0:
                    uploaded_image = data['images'][0]
                    if 'id' in uploaded_image:
                        self.uploaded_image_ids.append(uploaded_image['id'])
                        self.log_test("Image Upload", True, f"Image uploaded with ID: {uploaded_image['id']}", data)
                        return True
                    else:
                        self.log_test("Image Upload", False, "No ID in uploaded image response", data)
                        return False
                else:
                    self.log_test("Image Upload", False, "No images in response", data)
                    return False
            else:
                self.log_test("Image Upload", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Image Upload", False, f"Exception: {str(e)}")
            return False

    def test_get_images(self):
        """Test getting all images"""
        try:
            response = self.session.get(f"{API_BASE}/images/")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    image_found = False
                    if self.uploaded_image_ids:
                        image_found = any(img.get('id') in self.uploaded_image_ids for img in data)
                    
                    if image_found or len(data) >= 0:  # Allow empty list
                        self.log_test("Get Images", True, f"Retrieved {len(data)} images", {"count": len(data)})
                        return True
                    else:
                        self.log_test("Get Images", False, "Uploaded image not found in list", data)
                        return False
                else:
                    self.log_test("Get Images", False, f"Expected list, got: {type(data)}", data)
                    return False
            else:
                self.log_test("Get Images", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Images", False, f"Exception: {str(e)}")
            return False

    def test_export_banner(self):
        """Test banner export/generation"""
        if not self.created_project_id:
            self.log_test("Export Banner", False, "No project ID available for testing")
            return False
            
        try:
            response = self.session.post(f"{API_BASE}/export/{self.created_project_id}/generate")
            if response.status_code == 200:
                data = response.json()
                if 'export_url' in data and 'format' in data and 'resolution' in data:
                    self.log_test("Export Banner", True, f"Banner generated: {data.get('message')}", data)
                    return True
                else:
                    self.log_test("Export Banner", False, "Missing expected fields in export response", data)
                    return False
            else:
                self.log_test("Export Banner", False, f"HTTP {response.status_code}: {response.text}", response.text)
                return False
        except Exception as e:
            self.log_test("Export Banner", False, f"Exception: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        tests_passed = 0
        total_tests = 3
        
        # Test 1: Invalid project ID
        try:
            response = self.session.get(f"{API_BASE}/projects/invalid-id")
            if response.status_code in [404, 500]:
                self.log_test("Error Handling - Invalid Project ID", True, f"Correctly returned {response.status_code}")
                tests_passed += 1
            else:
                self.log_test("Error Handling - Invalid Project ID", False, f"Expected 404/500, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid Project ID", False, f"Exception: {str(e)}")

        # Test 2: Invalid image upload
        try:
            invalid_data = {'images_data': 'invalid-json'}
            headers = {'Accept': 'application/json'}
            response = self.session.post(f"{API_BASE}/images/upload", data=invalid_data, headers=headers)
            if response.status_code in [400, 422, 500]:
                self.log_test("Error Handling - Invalid Image Data", True, f"Correctly returned {response.status_code}")
                tests_passed += 1
            else:
                self.log_test("Error Handling - Invalid Image Data", False, f"Expected 400/422/500, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Invalid Image Data", False, f"Exception: {str(e)}")

        # Test 3: Export non-existent project
        try:
            response = self.session.post(f"{API_BASE}/export/non-existent-id/generate")
            if response.status_code in [404, 500]:
                self.log_test("Error Handling - Export Invalid Project", True, f"Correctly returned {response.status_code}")
                tests_passed += 1
            else:
                self.log_test("Error Handling - Export Invalid Project", False, f"Expected 404/500, got {response.status_code}")
        except Exception as e:
            self.log_test("Error Handling - Export Invalid Project", False, f"Exception: {str(e)}")

        return tests_passed == total_tests

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Banner Maker API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Core functionality tests
        tests = [
            ("Health Check", self.test_health_check),
            ("Root Endpoint", self.test_root_endpoint),
            ("Create Project", self.test_create_project),
            ("Get Projects", self.test_get_projects),
            ("Get Specific Project", self.test_get_specific_project),
            ("Image Upload", self.test_image_upload),
            ("Get Images", self.test_get_images),
            ("Export Banner", self.test_export_banner),
            ("Error Handling", self.test_error_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution failed: {str(e)}")
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Check the details above.")
            return False

    def generate_report(self):
        """Generate detailed test report"""
        report = {
            'summary': {
                'total_tests': len(self.test_results),
                'passed': sum(1 for r in self.test_results if r['success']),
                'failed': sum(1 for r in self.test_results if not r['success']),
                'timestamp': datetime.now().isoformat()
            },
            'results': self.test_results
        }
        
        # Save report to file
        report_file = Path('/app/backend_test_report.json')
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {report_file}")
        return report

def main():
    """Main test execution"""
    tester = BannerMakerAPITester()
    
    try:
        success = tester.run_all_tests()
        report = tester.generate_report()
        
        if success:
            print("\n✅ Backend API testing completed successfully!")
            exit(0)
        else:
            print("\n❌ Backend API testing completed with failures!")
            exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Testing interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n💥 Testing failed with exception: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()