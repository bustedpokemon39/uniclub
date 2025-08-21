import React, { useState, useEffect } from 'react';

const DebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // Get debug info about current state
    const token = localStorage.getItem('token');
    const authToken = localStorage.getItem('authToken'); // Check if it's stored differently
    
    setDebugInfo({
      token: token ? `${token.substring(0, 20)}...` : 'No token',
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'No authToken',
      localStorage: Object.keys(localStorage),
      currentUrl: window.location.href
    });
  }, []);

  const testHealthEndpoint = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        health: { status: response.status, data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        health: { error: error.message }
      }));
    }
  };

  const testUserProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        userProfile: { status: response.status, data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        userProfile: { error: error.message }
      }));
    }
  };

  const testEngagementEndpoint = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/engagement/user/News/123456789012345678901234', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        engagement: { status: response.status, data }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        engagement: { error: error.message }
      }));
    }
  };

  const testUploadFile = async () => {
    try {
      // Create a test file
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], 'test-avatar.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('avatar', file);

        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await response.json();
        setTestResults(prev => ({
          ...prev,
          upload: { status: response.status, data }
        }));
      }, 'image/png');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        upload: { error: error.message }
      }));
    }
  };

  return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔧 Debug Page
        </h1>

        {/* Debug Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={testHealthEndpoint}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Health
          </button>
          <button
            onClick={testUserProfile}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Test Profile
          </button>
          <button
            onClick={testEngagementEndpoint}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Test Engagement
          </button>
          <button
            onClick={testUploadFile}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Test Upload
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto h-96">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">
            Instructions:
          </h3>
          <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>1. First, make sure you're logged in</li>
            <li>2. Test Health to verify backend connection</li>
            <li>3. Test Profile to check authentication</li>
            <li>4. Test Engagement to verify new API</li>
            <li>5. Test Upload to check file upload</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugPage; 