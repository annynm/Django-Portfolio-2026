from django.conf import settings
from django.shortcuts import render


def index(request):
    projects = [
        {"title": "Project 1", "description": "Description here"},
        {"title": "Project 2", "description": "Description here"},
        {"title": "Project 3", "description": "Description here"},
        {"title": "Project 4", "description": "Description here"},
        {"title": "Project 5", "description": "Description here"},
    ]

    # --- NEW: random blog posts ---
    blog_posts = [
        {
            "title": "Why I switched to Django",
            "description": "A story about productivity and Python magic.",
        },
        {
            "title": "Watercolor and Code",
            "description": "Finding creativity in both art and programming.",
        },
        {
            "title": "Cycling through the Cascades",
            "description": "Adventures on two wheels in the Pacific Northwest.",
        },
        {
            "title": "Jazz Improv for Developers",
            "description": "Lessons from music that apply to writing clean code.",
        },
        {
            "title": "My Favourite VS Code Extensions",
            "description": "Tools that make me more productive every day.",
        },
    ]

    sections = [
        {
            "id": "home",
            "title": "Home",
            "bg_image": settings.STATIC_URL + "bgimage/main.jpg",
            "left_color": "#efa940",
            "right_color": "#6fc586",
            "foreground_template": "core/partials/foreground.html",
            "extra_context": None,
        },
        {
            "id": "projects",
            "title": "Projects",
            "bg_image": settings.STATIC_URL + "bgimage/projects.jpg",
            "left_color": "#d45c4c",
            "right_color": "#f4a261",
            "foreground_template": "core/partials/foreground.html",
            "extra_context": {"projects": projects},
        },
        {
            "id": "interests",
            "title": "Interests",
            "bg_image": settings.STATIC_URL + "bgimage/interests.jpg",
            "left_color": "#2a9d8f",
            "right_color": "#e9c46a",
            "foreground_template": "core/partials/foreground.html",
            "projects": [
                {
                    "title": "Watercolor Painting",
                    "description": "Abstract landscapes and portraits",
                },
                {
                    "title": "Cycling",
                    "description": "Road and mountain biking in the Pacific Northwest",
                },
                {
                    "title": "Jazz Guitar",
                    "description": "Playing standards with local groups",
                },
            ],
        },
        {
            "id": "videos",
            "title": "Videos",
            "bg_image": settings.STATIC_URL + "bgimage/videos.jpg",
            "left_color": "#e76f51",
            "right_color": "#f4a261",
            "foreground_template": "core/partials/foreground.html",
            "projects": [
                {
                    "title": "Demo Reel 2025",
                    "description": "Motion graphics and editing showcase",
                },
                {
                    "title": "Coding Tutorial",
                    "description": "Building a Django portfolio step by step",
                },
                {
                    "title": "Live Performance",
                    "description": "Jazz trio at The Velvet Note",
                },
            ],
        },
        # --- NEW BLOG SECTION ---
        {
            "id": "blog",
            "title": "Blog",
            "bg_image": settings.STATIC_URL
            + "bgimage/blog.jpg",  # make sure this file exists or use a different one
            "left_color": "#8ec07c",  # soft green
            "right_color": "#3c6e71",  # muted teal
            "foreground_template": "core/partials/foreground.html",
            "projects": blog_posts,  # directly passed as projects
        },
        {
            "id": "footer",
            "title": "Footer",
            "bg_image": "",
            "left_color": "#333333",
            "right_color": "#333333",
            "foreground_template": "core/partials/foreground.html",
            "extra_context": None,
        },
    ]

    context = {
        "nav_links": [
            {"title": "HOME", "url": "#home", "external": False},
            {"title": "PROJECTS", "url": "#projects", "external": False},
            {"title": "INTERESTS", "url": "#interests", "external": False},
            {"title": "VIDEOS", "url": "#videos", "external": False},
            {"title": "BLOG", "url": "#blog", "external": False},  # new nav link
            {"title": "GIT", "url": "https://github.com/annynm", "external": True},
            {"title": "RESUME", "url": "/resume/", "external": False},
        ],
        "sections": sections,
    }
    return render(request, "main/index.html", context)
