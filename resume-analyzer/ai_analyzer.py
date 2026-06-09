import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Securely fetch the key
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

def analyze_resume(resume_text: str, target_role: str) -> dict:
    
    prompt = f"""
    You are PrepHire, a brutally honest resume analyzer. Analyze this resume strictly.
    Target Role: {target_role}
    
    
    Resume Text:
    {resume_text}
    STRICT SCORING RULES — follow these exactly:

    SCORING PHILOSOPHY:
- You are a senior hiring manager who has seen 10,000 resumes
- Most resumes are mediocre — score accordingly
- Average resume scores 35-55. Only exceptional ones cross 75.
- Irrelevant skills to target role = heavy penalty

PILLAR 1 — DESIGN & ATS (max 15 points):
- Unprofessional formatting → max 7
- Clean but not ATS optimized → up to 11
- Perfect ATS formatting → up to 15

PILLAR 2 — CREDENTIALS (max 10 points):
- Automatically identify valuable certifications for {target_role}
- No certifications → max 4
- Irrelevant certifications → max 5
- Participation only (Forage, hackathon attendance) → 1 point max each
- Relevant strong certifications → up to 10

PILLAR 3 — EXPERIENCE (max 35 points):
- Zero internship → max 15
- Internship exists but zero metrics → max 22
- Internship with some metrics → max 28
- Internship with strong quantified impact → up to 35
- Internship completely irrelevant to {target_role} → max 10

PILLAR 4 — FUTURE PROOF SKILLS (max 20 points):
- Automatically identify top 5 in-demand skills for {target_role}
- Skills completely irrelevant to {target_role} → max 5
- Listed but not demonstrated in projects → half points only
- Missing top 3 skills for {target_role} → cannot exceed 12
- Strong demonstrated skill match → up to 20

PILLAR 5 — PROJECTS (max 20 points):
- Automatically judge project relevance for {target_role}
- Projects completely irrelevant to {target_role} → max 8
- No live links or GitHub → deduct 4 points
- Tutorial clone projects → max 10
- Partially relevant projects → up to 14
- Highly relevant projects with live links → up to 20

ROLE SWITCH PENALTY:
- If candidate's entire background is irrelevant to {target_role}
- Apply 40% penalty to Pillars 3, 4, 5 scores
- Clearly state in verdict: "Career switch detected"

STRICT RULES:
- A student with no internship should NEVER exceed 60 total
- Only truly exceptional resumes score above 80
- Penalize heavily for: placeholder text, missing links,
  vague descriptions, zero metrics, irrelevant skills
- Be strict. Most resumes score 30-60.

    
    Return ONLY a JSON object with this exact structure, no extra text:
    {{
        "candidate_name": "extracted from resume or Unknown",
        "target_role": "{target_role}",

        "overall_score": <sum of all pillar scores>,
        "grade": "<A+/A/B+/B/C/D based on score>",
        "pillars": {{
            "pillar_1_design_ats": {{
                "score": <0-15>,
                "max_score": 15,
                "reason": "<specific reason for this score>",
                "improvements": ["<specific fix 1>", "<specific fix 2>"]
            }},
            "pillar_2_credentials": {{
                "score": <0-10>,
                "max_score": 10,
                "reason": "<specific reason>",
                "improvements": ["<fix 1>", "<fix 2>"]
            }},
            "pillar_3_experience": {{
                "score": <0-35>,
                "max_score": 35,
                "reason": "<specific reason>",
                "improvements": ["<fix 1>", "<fix 2>"]
            }},
            "pillar_4_future_proof": {{
                "score": <0-20>,
                "max_score": 20,
                "reason": "<specific reason>",
                "improvements": ["<fix 1>", "<fix 2>"]
            }},
            "pillar_5_projects": {{
                "score": <0-20>,
                "max_score": 20,
                "reason": "<specific reason>",
                "improvements": ["<fix 1>", "<fix 2>"]
            }}
        }},
        "top_priority_fix": "<single most important improvement>",
        "verdict": "<3 sentence honest overall verdict>"
    }}
    """
    
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )
    
    # Clean response and parse as JSON
    import json
    import re
    
    text = response.text
    # Remove markdown code blocks if present
    text = re.sub(r'```json\n?', '', text)
    text = re.sub(r'```\n?', '', text)
    
    return json.loads(text.strip())