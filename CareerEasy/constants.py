import re


DEEPSEEK_API_URL = "https://api.deepseek.com"
MAX_ATTEMPTS = 4
NUM_AI_HIGHLIGHTS = 4
COMPANY_CAREERS = {
    "IT": [
        "software engineer",
        "machine learning engineer",
        "data engineer",
        "web developer",
        "UI/UX designer",
        "front-end developer",
        "back-end developer",
        "full-stack developer",
        "graphic designer",
        "tech support specialist",
        "sysadmin",
        "product manager",
    ],
    "Finance": [
        "accountant",
        "financial analyst",
        "business analyst",
        "sales manager",
        "data analyst",
    ],
    "Engineering": [
        "civil engineer",
        "mechanical engineer",
        "electrical engineer",
        "chemical engineer",
        "biomedical engineer",
        "environmental engineer",
        "product manager",
    ],
    "Gaming": [
        "game developer",
        "game designer",
        "software engineer",
        "graphic designer",
        "animator",
        "product manager",
        "music producer"
    ],
    "High school": [
        f"high school {subject} teacher"
        for subject in ["math",
                        "english",
                        "foreign language",
                        "physics",
                        "chemistry",
                        "biology",
                        "history",
                        "geography",
                        "art",
                        "music",
                        "physical education"]
    ],
    "Healthcare": [
        "registered nurse",
        "doctor",
        "pharmacist",
        "therapist",
        "physical therapist",
    ],
    "Media": [
        "video producer",
        "music producer",
        "video editor",
        "journalist",
        "animator",
        "cinematographer",
        "graphic designer",
    ],
    "General": [
        "human resources manager",
        "marketing manager",
        "office assistant",
        "office clerk"
    ]
}
COMPANY_CAREERS_WEIGHTS = [10, 5, 7, 5, 7, 5, 6, 16]
FAKE_COMPANY_NAMES = {
    "IT": [
        " Tech Solutions",
        "Tech",
        " Tech",
        " Innovation",
        " Solutions",
        " Infotech",
        ".ai",
        " Technologies"
    ],
    "Finance": [
        " Finance",
        " Financial",
        " Capital",
        " Wealth",
        " Investment",
        " Insurance",
        " Consulting",
        " Advisory"
    ],
    "Engineering": [
        " Engineering",
        " Manufacturing",
        " Engineering Solutions",
        "Tech",
        " Tech"
    ],
    "Gaming": [
        " Games",
        " Game",
        "Game",
        " Studios",
        " Studio"
    ],
    "High school": [
        " Public High School",
        " High School",
        " Secondary School"
    ],
    "Healthcare": [
        " Healthcare",
        " Walk-in Clinic",
        " Medical Center",
        " Health",
        " Hospital"
    ],
    "Media": [
        " Media",
        " Studio",
        " Studios",
        " Production",
        " Films",
        " Videos"
    ]
}

COMPANY_NAME_COMPONENTS = ['Acute', 'Apex', 'Azure', 'Beacon', 'Blaze', 'Brilliant', 'Cascade', 'Celestial', 'Cipher',
                           'Cobalt', 'Cosmic', 'Crystal', 'Dawn', 'Delta', 'Diamond', 'Echo', 'Eclipse', 'Elite',
                           'Ember', 'Epic', 'Eternal', 'Evergreen', 'Falcon', 'Flame', 'Flow', 'Forge', 'Frontier',
                           'Fusion', 'Galaxy', 'Genesis', 'Globe', 'Golden', 'Gravity', 'Horizon', 'Infinity', 'Iris',
                           'Jade', 'Jupiter', 'Keen', 'Laser', 'Lunar', 'Marble', 'Matrix', 'Mercury', 'Meteor',
                           'Midnight', 'Mirage',
                           'Nebula', 'Noble', 'Nova', 'Ocean', 'Omega', 'Orbit', 'Pearl', 'Phoenix', 'Platinum',
                           'Prism', 'Quantum', 'Radiant', 'Rainbow', 'Riverside', 'Ruby', 'Sapphire', 'Saturn',
                           'Serene', 'Shadow', 'Silver', 'Sky', 'Solar', 'Spark', 'Star', 'Stellar', 'Summit',
                           'Sunrise', 'Swift', 'Terra', 'Thunder', 'Titan', 'Torch', 'Tranquil', 'Triumph', 'Twilight',
                           'Umbrella', 'Unity', 'Vertex', 'Vibrant', 'Victory', 'Vision', 'Vital', 'Vortex', 'Zenith',
                           'Zephyr', 'Zero', 'Zinc', 'Zodiac', 'Zulu']

LOCATION_WITH_WEIGHT = {
    "United States":
        ([
             "New York City, NY",
             "Los Angeles, CA",
             "Chicago, IL",
             "Houston, TX",
             "Philadelphia, PA",
             "Pittsburgh, PA",
             "San Francisco, CA",
             "Seattle, WA",
             "Denver, CO",
             "Washington, DC",
             "Boston, MA",
             "Atlanta, GA",
             "Dallas, TX",
             "Miami, FL",
             "Tampa, FL",
             "Austin, TX",
             "Portland, OR",
             "San Diego, CA",
             "Las Vegas, NV",
             "Oakland, CA",
             "San Jose, CA"
         ],
         [10, 9, 7, 6, 4, 4, 7, 6, 5, 4, 7, 6, 4, 4, 4, 4, 4, 5, 5, 6, 5]),
    "Canada":
        ([
             "Toronto, ON",
             "Vancouver, BC",
             "Ottawa, ON",
             "Montreal, QC",
             "Calgary, AB",
             "Edmonton, AB",
             "Saskatoon, SK",
             "Halifax, NS",
             "London, ON",
             "Kitchener-Waterloo, ON",
             "Hamilton, ON",
             "Winnipeg, MB"
         ],
         [10, 7, 5, 8, 6, 6, 3, 3, 3, 3, 3, 3])
}

PROMPT_NLQ = ""
with open("CareerEasy/prompts/nlq.txt", "r") as f:
    PROMPT_NLQ = f.read()

PROMPT_CANDIDATE_EXP = ""
with open("CareerEasy/prompts/candidate_exp.txt", "r") as f:
    PROMPT_CANDIDATE_EXP = f.read()

PROMPT_CANDIDATE_SKILLS = ""
with open("CareerEasy/prompts/candidate_skills.txt", "r") as f:
    PROMPT_CANDIDATE_SKILLS = f.read()

PROMPT_CANDIDATE_AI_HIGHLIGHTS = ""
with open("CareerEasy/prompts/candidate_ai_highlights.txt", "r") as f:
    PROMPT_CANDIDATE_AI_HIGHLIGHTS = f.read()
    
PROMPT_CANDIDATE_AI_HIGHLIGHTS_CUSTOMIZE = ""
with open("CareerEasy/prompts/candidate_ai_highlights_customize.txt", "r") as f:
    PROMPT_CANDIDATE_AI_HIGHLIGHTS_CUSTOMIZE = f.read()
    
PROMPT_CHECK_FIT = ""
with open("CareerEasy/prompts/am_i_a_good_fit.txt", "r") as f:
    PROMPT_CHECK_FIT = f.read()
    
STANDARDIZE_FN = lambda x: None if x is None else re.sub(r'[^a-zA-Z0-9\s]', '', x).lower()