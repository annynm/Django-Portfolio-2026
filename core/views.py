from django.conf import settings
from django.shortcuts import render


def home(request):
    context = {
        "nav_links": [
            {"title": "HOME", "url": "/"},
            {"title": "PROJECTS", "url": "/projects/"},
            {"title": "INTERESTS", "url": "/interests/"},
            {"title": "VIDEOS", "url": "/videos/"},
            {"title": "GIT", "url": "https://github.com/annyn"},
            {"title": "RESUME", "url": "/resume/"},
        ],
        "bg_image_url": settings.STATIC_URL + "bgimage/main.jpg",
        "box_left_color": "#efa940",
        "box_right_color": "#6fc586",
        "projects": [
            {"title": "Project 1", "description": "Description here"},
            {"title": "Project 2", "description": "Description here"},
            {"title": "Project 3", "description": "Description here"},
            {"title": "Project 4", "description": "Description here"},
            {"title": "Project 5", "description": "Description here"},
        ],
    }
    return render(request, "main/home.html", context)
