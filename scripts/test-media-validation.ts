#!/usr/bin/env npx tsx

/**
 * Test script for Media API validation and error handling
 * This script tests file type validation, size limits, and error responses
 */

// Test configuration
const BASE_URL = 'http://localhost:3000';

interface ValidationTestResult {
  name: string;
  success: boolean;
  expectedError?: string;
  actualError?: string;
  data?: any;
}

class MediaValidationTester {
  private results: ValidationTestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Media API Validation Tests...\n');

    try {
      // Test 1: Empty file
      await this.testEmptyFile();

      // Test 2: Invalid file type
      await this.testInvalidFileType();

      // Test 3: File too large (simulate)
      await this.testFileTooLarge();

      // Test 4: Missing file
      await this.testMissingFile();

      // Test 5: Invalid filename
      await this.testInvalidFilename();

      // Test 6: Valid file types
      await this.testValidFileTypes();

    } catch (error) {
      console.error('❌ Validation test suite failed:', error);
    }

    this.printResults();
  }

  private async testEmptyFile(): Promise<ValidationTestResult> {
    const testName = 'Empty File Validation';
    console.log(`🔄 Testing: ${testName}`);

    try {
      const formData = new FormData();
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      formData.append('file', emptyFile);

      const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 400 && data.code === 'EMPTY_FILE') {
        const result: ValidationTestResult = {
          name: testName,
          success: true,
          expectedError: 'EMPTY_FILE',
          actualError: data.code,
        };

        this.results.push(result);
        console.log(`✅ ${testName} - Correctly rejected empty file`);
        return result;
      } else {
        throw new Error(`Expected 400 with EMPTY_FILE, got ${response.status} with ${data.code}`);
      }

    } catch (error) {
      const result: ValidationTestResult = {
        name: testName,
        success: false,
        expectedError: 'EMPTY_FILE',
        actualError: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      console.log(`❌ ${testName} - Error: ${result.actualError}`);
      return result;
    }
  }

  private async testInvalidFileType(): Promise<ValidationTestResult> {
    const testName = 'Invalid File Type Validation';
    console.log(`🔄 Testing: ${testName}`);

    try {
      const formData = new FormData();
      // Create a fake PDF file
      const invalidFile = new File(['fake pdf content'], 'document.pdf', { type: 'application/pdf' });
      formData.append('file', invalidFile);

      const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 415 && data.code === 'INVALID_FILE_TYPE') {
        const result: ValidationTestResult = {
          name: testName,
          success: true,
          expectedError: 'INVALID_FILE_TYPE',
          actualError: data.code,
        };

        this.results.push(result);
        console.log(`✅ ${testName} - Correctly rejected PDF file`);
        return result;
      } else {
        throw new Error(`Expected 415 with INVALID_FILE_TYPE, got ${response.status} with ${data.code}`);
      }

    } catch (error) {
      const result: ValidationTestResult = {
        name: testName,
        success: false,
        expectedError: 'INVALID_FILE_TYPE',
        actualError: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      console.log(`❌ ${testName} - Error: ${result.actualError}`);
      return result;
    }
  }

  private async testFileTooLarge(): Promise<ValidationTestResult> {
    const testName = 'File Size Limit Validation';
    console.log(`🔄 Testing: ${testName}`);

    try {
      const formData = new FormData();
      // Create a file larger than 5MB (simulate with a large buffer)
      const largeBuffer = new ArrayBuffer(6 * 1024 * 1024); // 6MB
      const largeFile = new File([largeBuffer], 'large-image.jpg', { type: 'image/jpeg' });
      formData.append('file', largeFile);

      const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 413 && data.code === 'FILE_TOO_LARGE') {
        const result: ValidationTestResult = {
          name: testName,
          success: true,
          expectedError: 'FILE_TOO_LARGE',
          actualError: data.code,
        };

        this.results.push(result);
        console.log(`✅ ${testName} - Correctly rejected large file`);
        return result;
      } else {
        throw new Error(`Expected 413 with FILE_TOO_LARGE, got ${response.status} with ${data.code}`);
      }

    } catch (error) {
      const result: ValidationTestResult = {
        name: testName,
        success: false,
        expectedError: 'FILE_TOO_LARGE',
        actualError: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      console.log(`❌ ${testName} - Error: ${result.actualError}`);
      return result;
    }
  }

  private async testMissingFile(): Promise<ValidationTestResult> {
    const testName = 'Missing File Validation';
    console.log(`🔄 Testing: ${testName}`);

    try {
      const formData = new FormData();
      // Don't append any file

      const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 400 && data.code === 'NO_FILE') {
        const result: ValidationTestResult = {
          name: testName,
          success: true,
          expectedError: 'NO_FILE',
          actualError: data.code,
        };

        this.results.push(result);
        console.log(`✅ ${testName} - Correctly rejected missing file`);
        return result;
      } else {
        throw new Error(`Expected 400 with NO_FILE, got ${response.status} with ${data.code}`);
      }

    } catch (error) {
      const result: ValidationTestResult = {
        name: testName,
        success: false,
        expectedError: 'NO_FILE',
        actualError: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      console.log(`❌ ${testName} - Error: ${result.actualError}`);
      return result;
    }
  }

  private async testInvalidFilename(): Promise<ValidationTestResult> {
    const testName = 'Invalid Filename Validation';
    console.log(`🔄 Testing: ${testName}`);

    try {
      const formData = new FormData();
      // Create a file with empty filename
      const fileWithEmptyName = new File(['test content'], '', { type: 'image/jpeg' });
      formData.append('file', fileWithEmptyName);

      const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 400 && data.code === 'INVALID_FILENAME') {
        const result: ValidationTestResult = {
          name: testName,
          success: true,
          expectedError: 'INVALID_FILENAME',
          actualError: data.code,
        };

        this.results.push(result);
        console.log(`✅ ${testName} - Correctly rejected empty filename`);
        return result;
      } else {
        throw new Error(`Expected 400 with INVALID_FILENAME, got ${response.status} with ${data.code}`);
      }

    } catch (error) {
      const result: ValidationTestResult = {
        name: testName,
        success: false,
        expectedError: 'INVALID_FILENAME',
        actualError: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      console.log(`❌ ${testName} - Error: ${result.actualError}`);
      return result;
    }
  }

  private async testValidFileTypes(): Promise<ValidationTestResult> {
    const testName = 'Valid File Types Acceptance';
    console.log(`🔄 Testing: ${testName}`);

    const validTypes = [
      { type: 'image/jpeg', ext: 'jpg' },
      { type: 'image/png', ext: 'png' },
      { type: 'image/webp', ext: 'webp' },
      { type: 'image/gif', ext: 'gif' },
      { type: 'image/svg+xml', ext: 'svg' },
    ];

    const uploadedIds: string[] = [];

    try {
      for (const fileType of validTypes) {
        const formData = new FormData();
        
        // Create a small valid file for each type
        let fileContent: string;
        if (fileType.type === 'image/svg+xml') {
          fileContent = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>';
        } else {
          fileContent = 'fake image content'; // For testing purposes
        }
        
        const file = new File([fileContent], `test.${fileType.ext}`, { type: fileType.type });
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/api/admin/media/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          uploadedIds.push(data.data.id);
          console.log(`  ✅ ${fileType.type} accepted`);
        } else {
          console.log(`  ❌ ${fileType.type} rejected: ${data.error}`);
        }
      }

      // Clean up uploaded test files
      for (const id of uploadedIds) {
        try {
          await fetch(`${BASE_URL}/api/admin/media/${id}`, { method: 'DELETE' });
        } catch (error) {
          console.log(`  ⚠️  Failed to clean up ${id}`);
        }
      }

      const result: ValidationTestResult = {
        name: testName,
        success: uploadedIds.length === validTypes.length,
        data: { acceptedTypes: uploadedIds.length, totalTypes: validTypes.length },
      };

      this.results.push(result);
      
      if (result.success) {
        console.log(`✅ ${testName} - All valid types accepted`);
      } else {
        console.log(`❌ ${testName} - Only ${uploadedIds.length}/${validTypes.length} types accepted`);
      }
      
      return result;

    } catch (error) {
      const result: ValidationTestResult = {
        name: testName,
        success: false,
        actualError: error instanceof Error ? error.message : String(error),
      };

      this.results.push(result);
      console.log(`❌ ${testName} - Error: ${result.actualError}`);
      return result;
    }
  }

  private printResults(): void {
    console.log('\n📊 Validation Test Results Summary:');
    console.log('===================================');

    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;

    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.name}`);
      
      if (result.expectedError && result.actualError) {
        if (result.success) {
          console.log(`   Expected: ${result.expectedError}, Got: ${result.actualError} ✓`);
        } else {
          console.log(`   Expected: ${result.expectedError}, Got: ${result.actualError} ✗`);
        }
      } else if (!result.success && result.actualError) {
        console.log(`   Error: ${result.actualError}`);
      }
    });

    console.log(`\n📈 Overall: ${passed}/${total} validation tests passed`);
    
    if (passed === total) {
      console.log('🎉 All validation tests passed! Error handling is working correctly.');
    } else {
      console.log('⚠️  Some validation tests failed. Please check the error handling.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new MediaValidationTester();
  tester.runAllTests().catch(console.error);
}

export { MediaValidationTester };