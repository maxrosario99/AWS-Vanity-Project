Vanity Number Converter Lambda Project
Project Overview

This project involves creating an AWS Lambda function that converts phone numbers into vanity numbers and saves the top 5 resulting vanity numbers along with the caller's number in a DynamoDB table. Additionally, an Amazon Connect contact flow will utilize this Lambda function to provide the caller with the top 3 vanity number possibilities.

Solution Explanation:

Implementation Details

    - Phone Number Conversion: The Lambda function converts the last 4 digits of a phone number into possible vanity combinations using a predefined mapping of digits to letters.
    - Vanity Number Validation: Each generated combination is checked against a dictionary API to determine if it is a valid word.
    - Ranking and Selection: Valid combinations are prioritized and moved to the front of the list. The top 5 combinations are selected.
    - Data Storage: The original phone number and the top 5 vanity numbers are stored in a DynamoDB table.
    - Amazon Connect Integration: An Amazon Connect contact flow retrieves the top 3 vanity numbers from the Lambda function and announces them to the caller.


Challenges and Solutions

- Performance Optimization: To avoid timeouts and long execution times, I limited the vanity number conversion to the last 4 digits of the phone number. This significantly reduced the number of combinations to check.
- Valid Word Checking: Using the dictionary API to check each combination ensured that only meaningful vanity numbers were considered.
- Prioritization of Results: By moving valid vanity numbers to the front of the list, I ensured that the most meaningful combinations were prioritized.

Shortcuts and Production Considerations

- Limiting to Last 4 Digits: This was done for efficiency, but in a production environment, a more robust solution would consider the entire phone number.
- Basic Validation and Ranking: The current solution uses a straightforward validation method. In a production setting, additional criteria and more complex ranking algorithms should be implemented.

Future Enhancements

Given more time, I would like to:

- Enhance Number Conversion: Implement a function to handle phone numbers in multiple formats and convert the entire number to vanity combinations.
- Improve Validation and Ranking: Add more criteria for checking combinations and develop a more sophisticated ranking system.
- Interactive Speech Bot: Develop a speech bot that allows users to interact with the system, such as entering different phone numbers for conversion.


