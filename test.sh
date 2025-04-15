#!/bin/bash

# Reset test project
echo "Resetting test project..."

# Create package.json with Lovable metadata
cat > test-project/package.json << 'EOF'
{
  "name": "lovable-test-project",
  "version": "1.0.0",
  "description": "A test project with Lovable metadata",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js",
    "lovable-deploy": "lovable-cli deploy",
    "lovable-build": "lovable-cli build"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "lovable-analytics": "^1.0.0",
    "@lovable/core": "^2.0.0",
    "@lovable/tracking": "^1.5.0"
  },
  "lovable": {
    "projectId": "test-123",
    "tracking": {
      "enabled": true,
      "anonymize": false
    }
  }
}
EOF

# Create index.html with Lovable metadata
cat > test-project/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="lovable:projectId" content="test-123">
  <meta name="lovable:version" content="1.0.0">
  <title>Lovable Test Project</title>
</head>
<body>
  <h1>Lovable Test Project</h1>
  <p>This is a test project with Lovable metadata.</p>
  
  <script src="https://cdn.lovable.io/analytics.js"></script>
  <script data-lovable="true">
    window.lovable.init({
      projectId: 'test-123',
      tracking: true
    });
  </script>
  <script>
    // Regular script that should not be removed
    console.log('Hello, world!');
  </script>
</body>
</html>
EOF

# Remove wrangler.toml if it exists
rm -f test-project/wrangler.toml

echo "Test project reset complete."

# Run the delovable CLI
echo "Running delovable CLI..."
node dist/index.js test-project --platform cloudflare --verbose

# Check the results
echo -e "\nChecking results..."
echo -e "\npackage.json:"
cat test-project/package.json

echo -e "\nindex.html:"
cat test-project/index.html

echo -e "\nwrangler.toml:"
cat test-project/wrangler.toml

echo -e "\nTest complete."
