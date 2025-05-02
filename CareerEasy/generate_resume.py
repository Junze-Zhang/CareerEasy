import random
import numpy as np
from openai import OpenAI
import names
from tqdm import tqdm

from llm_utils import llm_request
from constants import *

NUM_RESUME = 20


def yoe():
    years_of_exp = random.choices(range(0, 15),
                                  weights=[10, 8, 5, 3, 2,
                                           1.6, 1.3, 1.1, 0.9, 0.7,
                                           0.5, 0.4, 0.3, 0.3, 0.3],
                                  k=1)[0]
    match years_of_exp:
        case 0:
            level = "new graduate"
        case i if 1 <= i <= 2:
            level = "junior"
        case i if 3 <= i <= 4:
            level = "mid-level"
        case _:
            level = "senior"
    if years_of_exp:
        exp = f"{years_of_exp} year{'' if years_of_exp == 1 else 's'} of experience"
    else:
        exp = f"no career experience, but multiple related projects in university"
    return level, exp, years_of_exp


def random_name_id():
    first = names.get_first_name()
    last = names.get_last_name()
    name_id = "{:03}".format(random.randint(1, 999))
    return first, last, name_id


def personal_information(first, last, name_id):
    name_identifier = f"{first.lower()}{last.lower()}{name_id}"
    return f"""{first} {last}
{name_identifier}@gmail.com | [linkedin.com/in/{first}{last}](https://linkedin.com/in/{name_identifier}) | [github.com/{first}{last}](https://github.com/{name_identifier}) | [{name_identifier}.com](https://{name_identifier}.com)"""


ng_format = """
-name
-education
-projects
-skills
-certifications
"""

junior_format = """
-name
-education
-professional experience
-projects
-skills
"""

senior_format = """
-name
-education
-professional experience
-projects
-skills
"""

if __name__ == "__main__":
    if not os.path.exists("resume"):
        os.mkdir("resume")
    if not os.path.exists("resume/candidate_info.csv"):
        info = open(f"resume/candidate_info.csv", "w", encoding="utf-8")
        info.write("filename,career,yoe,email,phone\n")
    else:
        info = open(f"resume/candidate_info.csv", "a", encoding="utf-8")

    client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url=DEEPSEEK_API_URL)
    for i in tqdm(range(NUM_RESUME)):
        level, exp, year = yoe()
        career_type = random.choices(list(COMPANY_CAREERS.keys()), weights=COMPANY_CAREERS_WEIGHTS, k=1)[0]
        career = np.random.choice(COMPANY_CAREERS[career_type])
        article = "an" if career[0] in ["a", "e", "i", "o", "u"] else "a"
        prompt1 = """Suppose you are a {} {} with {}. You are applying for {} {} position.
Write a professional resume that highlights your skills and experience.
Write the resume in the following format:
{}
Please use John Doe as your name.
Please format the posting in markdown with appropriate headers for readability.
Do not include any text other than the resume itself.
        """.format(level, career, exp, article, career, ng_format if level == "new graduate"
        else junior_format if level == "junior" else senior_format)
        if i == 0:
            print(prompt1)

        messages = [{"role": "user", "content": prompt1}]
        resume = llm_request(client,
                             messages,
                             lambda r: "John Doe" in r,
                             "Invalid resume format:")
        first, last, userid = random_name_id()
        resume = resume.replace("John Doe", personal_information(first, last, userid))
        filename = f"{first}_{last}_resume.md"
        filepath = "resume/" + filename
        while os.path.exists(filepath):
            filepath = filepath.replace("_resume", f"_1_resume")
        with open(filepath, "w") as f:
            f.write(resume)
        info.write(
            f"{filename.replace("_resume.md", "")},"
            f"{career},"
            f"{year},"
            f"{first.lower()}{last.lower()}{userid}@{random.choice(["gmail", "outlook", "yahoo"])}.com,"
            f"+1 {random.randint(1000000000, 9999999999)}\n")
        info.flush()

    info.close()
