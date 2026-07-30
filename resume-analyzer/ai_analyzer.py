import os
from google import genai
import json
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
import re

load_dotenv()

# Securely fetch the key
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

search_tool = TavilySearch(max_results=2)

def fetch_market_context(target_role: str) -> str:
    """
    Executes compressed Tavily queries to get real-time 2026 job market data
    for Certifications, Future-Proof Skills, and Projects.
    """
    queries = {
        " (Certifications)": (
            f"Most valuable vs overrated certifications for {target_role} "
            f"fresher in India 2026 and what certs top companies look for."
        ),
        " (Market Trends)": (
            f"Top emerging in-demand skills, obsolete technologies, "
            f"and salary trends for {target_role} job postings in India 2026."
        ),
        " (Project Validator)": (
            f"Impressive portfolio projects vs overused resume projects to avoid "
            f"for a {target_role} fresher in India 2026."
        )
    }

    rag_snippets = []
    sources_list = []

    for pillar, query in queries.items():
        try:
            response = search_tool.invoke({"query": query})
            results = response.get("results", [])
            
            rag_snippets.append(f"=== {pillar} LIVE DATA ===")
            for res in results:
                snippet = res.get("content", "").strip()
                url = res.get("url", "")
                title = res.get("title", url)
                if snippet:
                    rag_snippets.append(f"- Source ({url}): {snippet}")
                    sources_list.append({
                        "pillar": pillar,
                        "title": title,
                        "url": url,
                        "snippet": snippet
                    })
        except Exception as e:
            # Fallback safety: If Tavily fails/times out, resume scanning won't crash
            rag_snippets.append(f"=== {pillar} LIVE DATA ===\n- Search unavailable: {str(e)}")

    return "\n\n".join(rag_snippets), sources_list

def analyze_resume(resume_text: str, target_role: str) -> dict:

    # 1. Fetch real-time market context via Tavily
    mmarket_context_text, market_sources = fetch_market_context(target_role)

    # 2. Build system prompt with Live RAG Context injected
    
    prompt = f"""
    You are PrepHire, a brutally honest resume analyzer. Analyze this resume strictly.
    Target Role: {target_role}

    LIVE MARKET CONTEXT (Real-Time 2026 Industry Standards):
    {mmarket_context_text}
    
    
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
- Use LIVE MARKET CONTEXT above to evaluate certification value for {target_role}
- No certifications → max 4
- Irrelevant/Overrated certifications → max 5
- Participation only (Forage, hackathon attendance) → 1 point max each
- Relevant strong certifications matching live market context → up to 10

PILLAR 3 — EXPERIENCE (max 35 points):
- Zero internship → max 15
- Internship exists but zero metrics → max 22
- Internship with some metrics → max 28
- Internship with strong quantified impact → up to 35
- Internship completely irrelevant to {target_role} → max 10

PILLAR 4 — FUTURE PROOF SKILLS (max 20 points):
- Use LIVE MARKET CONTEXT above to cross-check top in-demand 2026 skills for {target_role}
- Skills completely irrelevant to {target_role} → max 5
- Listed but not demonstrated in projects → half points only
- Missing top 3 skills for {target_role} → cannot exceed 12
- Strong demonstrated skill match with modern tech stack → up to 20

PILLAR 5 — PROJECTS (max 20 points):
- Use LIVE MARKET CONTEXT above to judge project relevance and complexity for {target_role}
- Projects completely irrelevant to {target_role} → max 8
- No live links or GitHub → deduct 4 points
- Tutorial clone or overused projects (identified in live context) → max 10
- Partially relevant projects → up to 14
- Highly relevant, unique projects matching 2026 market expectations with live links → up to 20

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
                "reason": "<specific reason grounded in live market data>",
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
                "reason": "<specific reason based on 2026 skill demand>",
                "improvements": ["<fix 1>", "<fix 2>"]
            }},
            "pillar_5_projects": {{
                "score": <0-20>,
                "max_score": 20,
                "reason": "<specific reason comparing projects to 2026 standards>",
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

    analysis_data = json.loads(text.strip())
    
    analysis_data["market_sources"] = market_sources
    return analysis_data
