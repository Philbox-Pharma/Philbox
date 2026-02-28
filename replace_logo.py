import os

directory = r"D:\1.STUDY\FYP\Main\Philbox\client\src"
target = 'src="/vite.svg"'
replacement = 'src="/Philbox.PNG"'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if target in content:
                content = content.replace(target, replacement)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
