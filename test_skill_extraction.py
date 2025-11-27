#!/usr/bin/env python3
"""
Test script to verify skill extraction from backend
"""
import requests
import json

# Test with sample resume and job description
resume_text = """
John Doe
Senior Software Developer

Experience:
- Python, JavaScript, TypeScript developer for 5 years
- Worked with React, Vue.js, Angular frameworks
- Database experience: PostgreSQL, MongoDB, Firebase
- Cloud platforms: AWS, Azure
- DevOps tools: Docker, Kubernetes, Jenkins
- Version control: Git, GitHub, GitLab
- APIs: REST API, GraphQL
- Tools: Node.js, Express, Django, FastAPI
- Machine Learning: TensorFlow, PyTorch, Keras, Pandas, NumPy
- Other: Linux, Agile, Scrum, JIRA
"""

job_description = """
Senior Full Stack Developer

Required Skills:
- JavaScript and TypeScript
- React or Vue.js
- Node.js and Express
- PostgreSQL or MySQL
- AWS or Azure
- Docker
- Git
- REST API design
- Agile and Scrum

Nice to Have:
- Python
- MongoDB
- Kubernetes
- GraphQL
"""

# Test the backend
try:
    response = requests.post(
        "http://localhost:8000/analyze/text",
        json={
            "resume_text": resume_text,
            "job_description": job_description
        },
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        analysis = result.get("analysis", {})
        
        print("=" * 60)
        print("SKILL EXTRACTION TEST RESULTS")
        print("=" * 60)
        
        print("\n📄 RESUME SKILLS DETECTED:")
        resume_skills = analysis.get("resume_skills_detected", [])
        print(f"Count: {len(resume_skills)}")
        print(f"Skills: {', '.join(resume_skills)}")
        
        print("\n🎯 JOB REQUIRED SKILLS:")
        required_skills = analysis.get("required_skills_from_job", [])
        print(f"Count: {len(required_skills)}")
        print(f"Skills: {', '.join(required_skills)}")
        
        print("\n✓ MATCHING SKILLS:")
        matching = analysis.get("matching_skills", [])
        print(f"Count: {len(matching)}")
        print(f"Skills: {', '.join(matching)}")
        
        print("\n📚 MISSING SKILLS:")
        missing = analysis.get("missing_skills", [])
        print(f"Count: {len(missing)}")
        print(f"Skills: {', '.join(missing)}")
        
        print(f"\n🎯 MATCH SCORE: {analysis.get('skill_match_score', 0):.1f}%")
        print(f"📊 Experience Level: {analysis.get('experience_level', 'Unknown')}")
        
        print("\n" + "=" * 60)
        print("FULL RESPONSE:")
        print("=" * 60)
        print(json.dumps(result, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to backend at http://localhost:8000")
    print("Make sure the ML API server is running: python app.py in ml_api folder")
except Exception as e:
    print(f"❌ Error: {e}")
