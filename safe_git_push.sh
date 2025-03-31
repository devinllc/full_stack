#!/bin/bash

# This script safely prepares your repository for pushing to Git
# by removing Firebase credentials and other sensitive files

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# 1. Backup the Firebase credentials file (if it exists)
if [ -f backend/firebase-credentials.json ]; then
  echo "Backing up Firebase credentials..."
  cp backend/firebase-credentials.json ~/firebase-credentials-backup.json
  echo "Backup saved to ~/firebase-credentials-backup.json"
fi

# 2. Remove Firebase credentials file
echo "Removing Firebase credentials file..."
rm -f backend/firebase-credentials.json

# 3. Make sure .gitignore is properly set up
echo "Verifying .gitignore..."
if ! grep -q "firebase-credentials.json" .gitignore; then
  echo "firebase-credentials.json" >> .gitignore
fi

# 4. Add, commit, and push changes
echo "Do you want to add and commit all changes? (y/n)"
read -r answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
  echo "Adding all files..."
  git add .
  
  echo "Enter commit message:"
  read -r message
  git commit -m "$message"
  
  echo "Pushing to remote repository..."
  git push
  
  echo "Changes pushed successfully!"
else
  echo "Changes not committed. You can manually run:"
  echo "  git add ."
  echo "  git commit -m \"Your message\""
  echo "  git push"
fi

# 5. Restore Firebase credentials after push
if [ -f ~/firebase-credentials-backup.json ]; then
  echo "Restoring Firebase credentials..."
  cp ~/firebase-credentials-backup.json backend/firebase-credentials.json
  echo "Firebase credentials restored."
fi

echo "Process completed successfully!" 