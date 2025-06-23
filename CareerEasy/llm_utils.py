import warnings
from typing import Callable, List, Dict

from CareerEasy.constants import MAX_ATTEMPTS


def llm_request(client,
                messages: List[Dict],
                validate_fn: Callable[[str], bool] = lambda _: True,
                validate_err_message="",
                model="deepseek-chat",
                postprocess_fn=lambda x: x.replace("```", "").replace("json", "").strip(),
                return_raw=False):
    for _ in range(MAX_ATTEMPTS):
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            stream=False
        )
        response_txt = response.choices[0].message.content
        if not validate_fn(postprocess_fn(response_txt)):
            warnings.warn(validate_err_message + response_txt[:100] + "...")
            print("warning:" + response_txt)
        else:
            return response.choices[0].message if return_raw else postprocess_fn(response_txt)
    return None
