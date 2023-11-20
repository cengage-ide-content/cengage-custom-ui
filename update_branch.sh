#!/bin/bash

# Set the parent branch name
parent_branch="main"

# Get a list of all branches in the repository
branches=$(git branch --format="%(refname:lstrip=2)")

# Loop through each branch
for branch in $branches
do
  # Skip the parent branch
  if [ "$branch" != "$parent_branch" ]; then
    # Check if the branch is a child of the parent branch
    is_child=$(git merge-base --is-ancestor $parent_branch $branch 2>/dev/null)

    if [ $? -eq 0 ]; then
      # Checkout the child branch
      git checkout $branch
      
      # Merge changes from the parent branch
      git merge $parent_branch
      
      # Check if there are any merge conflicts
      if [ $? -eq 0 ]; then
        # If no conflicts, continue to the next branch
        echo "Merge successful for branch $branch"
      else
        # If conflicts exist, resolve conflicts using the child branch
        echo "Merge conflict for branch $branch. Resolving using the child branch..."
        git checkout --theirs .
        git add .
        git commit -m "Resolved merge conflict using child branch"
        echo "Merge conflict resolved for branch $branch"
      fi
    fi
  fi
done