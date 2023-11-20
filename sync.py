#!/usr/bin/env python3

import subprocess

# Set the parent branch name
parent_branch = "parent_branch_name"

# Fetch all branches from the remote repository
subprocess.run(["git", "fetch", "--all"])

# Get a list of all branches in the repository
branches = subprocess.run(["git", "branch", "--all", "--format=%(refname:lstrip=2)"], capture_output=True, text=True).stdout.splitlines()

# Loop through each branch
for branch in branches:
    # Skip the parent branch and remote branches
    if branch != parent_branch and not branch.startswith("remotes/"):
        # Checkout the child branch
        subprocess.run(["git", "checkout", branch])
        
        # Merge changes from the parent branch
        merge_output = subprocess.run(["git", "merge", parent_branch], capture_output=True, text=True)
        
        # Check if there are any merge conflicts
        if merge_output.returncode == 0:
            # If no conflicts, continue to the next branch
            print(f"Merge successful for branch {branch}")
        else:
            # If conflicts exist, resolve conflicts using the child branch
            print(f"Merge conflict for branch {branch}. Resolving using the child branch...")
            subprocess.run(["git", "checkout", "--theirs", "."])
            subprocess.run(["git", "add", "."])
            subprocess.run(["git", "commit", "-m", "Resolved merge conflict using child branch"])
            print(f"Merge conflict resolved for branch {branch}")