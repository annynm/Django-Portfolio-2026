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
            "extra_context": None,
        },
        {
            "id": "videos",
            "title": "Videos",
            "bg_image": settings.STATIC_URL + "bgimage/videos.jpg",
            "left_color": "#e76f51",
            "right_color": "#f4a261",
            "foreground_template": "core/partials/foreground.html",
            "extra_context": None,
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
            {"title": "GIT", "url": "https://github.com/annynm", "external": True},
            {"title": "RESUME", "url": "/resume/", "external": False},
        ],
        "sections": sections,
    }
    return render(request, "main/index.html", context)
