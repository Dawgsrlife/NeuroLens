import openai

openai.api_key = "YOUR_OPENAI_API_KEY"

def query_llm(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100,
    )
    return response["choices"][0]["message"]["content"]
