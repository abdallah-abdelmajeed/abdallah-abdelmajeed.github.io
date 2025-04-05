<<<<<<< HEAD
# GitHub Repository Setup Guide

## Creating a New GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click the '+' icon in the top-right corner and select 'New repository'
3. Name your repository (e.g., 'personal-website-static')
4. Add a description (optional): 'Static HTML version of my personal website'
5. Choose public or private visibility
6. Do NOT initialize with README, .gitignore, or license (we already have these files)
7. Click 'Create repository'

## Connecting Your Local Repository to GitHub

After creating the repository, GitHub will show commands to connect your local repository. Follow these steps:

1. Copy the HTTPS URL of your new repository: `https://github.com/abdallah-abdelmajeed/personal-website-static.git`
2. Run the following commands in your terminal (replace the URL with your actual repository URL):

```
git remote add origin https://github.com/abdallah-abdelmajeed/personal-website-static.git
git branch -M main
git push -u origin main
```

3. Enter your GitHub username and password when prompted (or use a personal access token if you have 2FA enabled)

## Verifying Your Upload

After pushing your code:

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. Your static website is now stored in GitHub!

## Deploying Your Static Website (Optional)

You can easily deploy this static website using GitHub Pages:

1. Go to your repository on GitHub
2. Click on 'Settings'
3. Scroll down to 'GitHub Pages' section
4. Under 'Source', select 'main' branch
5. Click 'Save'
=======
# GitHub Repository Setup Guide

## Creating a New GitHub Repository

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click the '+' icon in the top-right corner and select 'New repository'
3. Name your repository (e.g., 'personal-website-static')
4. Add a description (optional): 'Static HTML version of my personal website'
5. Choose public or private visibility
6. Do NOT initialize with README, .gitignore, or license (we already have these files)
7. Click 'Create repository'

## Connecting Your Local Repository to GitHub

After creating the repository, GitHub will show commands to connect your local repository. Follow these steps:

1. Copy the HTTPS URL of your new repository: `https://github.com/abdallah-abdelmajeed/personal-website-static.git`
2. Run the following commands in your terminal (replace the URL with your actual repository URL):

```
git remote add origin https://github.com/abdallah-abdelmajeed/personal-website-static.git
git branch -M main
git push -u origin main
```

3. Enter your GitHub username and password when prompted (or use a personal access token if you have 2FA enabled)

## Verifying Your Upload

After pushing your code:

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. Your static website is now stored in GitHub!

## Deploying Your Static Website (Optional)

You can easily deploy this static website using GitHub Pages:

1. Go to your repository on GitHub
2. Click on 'Settings'
3. Scroll down to 'GitHub Pages' section
4. Under 'Source', select 'main' branch
5. Click 'Save'
>>>>>>> ce5182f74d0df33e7c0ab1048ed1aec2f209040c
6. After a few minutes, your site will be live at: `https://abdallah-abdelmajeed.github.io/personal-website-static/`