import re

with open('IntelliScan_All_Diagrams.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make all diagrams strictly emulate Draw.io standard layout
style_block = """skinparam monochrome true
skinparam shadowing false
skinparam defaultFontName Arial
skinparam roundcorner 4
skinparam ParticipantPadding 20
skinparam BoxPadding 10
skinparam NodePadding 20
skinparam UsecaseBorderThickness 1.5
skinparam RectangleBorderThickness 1.5
skinparam classAttributeIconSize 0
skinparam sequenceMessageAlign center
skinparam ArrowThickness 1.5
skinparam ArrowColor #000000
skinparam BackgroundColor #FFFFFF"""

# Find all blocks of skinparams and normalize them
content = re.sub(r'skinparam monochrome true.*?(?=skinparam defaultFontName|left to right direction|node |database|actor |class |usecase |title|@enduml|start)', style_block + '\n', content, flags=re.DOTALL)

with open('IntelliScan_All_Diagrams.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated diagrams HTML with extreme Draw.io skinparams.")
