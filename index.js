const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const axios = require("axios");

const toPhonewords = {
  2: "ABC",
  3: "DEF",
  4: "GHI",
  5: "JKL",
  6: "MNO",
  7: "PQRS",
  8: "TUV",
  9: "WXYZ",
};

function generateCombinations(phoneNumber) {
  const lastFourDigits = phoneNumber.slice(-4);
  let combos = lastFourDigits
    .split("")
    .map((digit) => toPhonewords[digit] || digit);
  return getAllCombinations(combos);
}

function getAllCombinations(arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0].split("");

  let result = arrays[0].split("");

  for (let i = 1; i < arrays.length; i++) {
    let next = [];
    for (let res of result) {
      for (let char of arrays[i].split("")) {
        next.push(res + char);
      }
    }
    result = next;
  }
  return result;
}

async function checkValidWord(word) {
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function filterRankCombos(combos) {
  let top5VanityNumbers = [];
  for (let combo of combos) {
    if (await checkValidWord(combo)) {
      top5VanityNumbers.unshift(combo);
    } else {
      top5VanityNumbers.push(combo);
    }
    if (top5VanityNumbers.length > 5) {
      top5VanityNumbers.pop();
    }
  }
  return top5VanityNumbers;
}

exports.handler = async (event) => {
  const phoneNumber =
    event.Details &&
    event.Details.Parameters &&
    event.Details.Parameters.phoneNumber;
  if (!phoneNumber) {
    return {
      statusCode: 400,
      body: {
        error: "Phone number is missing in the event parameters.",
      },
    };
  }

  const phoneRegex = /^(\+1)?\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return {
      statusCode: 400,
      body: {
        error:
          "Invalid phone number format. Please provide a 10-digit phone number with optional +1 prefix.",
      },
    };
  }

  const sanitizedPhoneNumber = phoneNumber.replace(/^\+1/, "");
  const combinations = generateCombinations(sanitizedPhoneNumber);
  const top5VanityNumbers = await filterRankCombos(combinations);

  const params = {
    TableName: "VanityNumbers",
    Item: {
      phoneNumber: sanitizedPhoneNumber,
      vanityNumbers: top5VanityNumbers,
    },
  };

  try {
    await dynamoDB.put(params).promise();
  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: "Could not save data to the DynamoDB database",
      },
    };
  }

  const top3vanityNumbers = {};
  const removedLastFour = sanitizedPhoneNumber.substr(0, 6);

  top5VanityNumbers.forEach((vanityNumber, index) => {
    top3vanityNumbers[index] = removedLastFour + vanityNumber;
  });

  return {
    statusCode: 200,
    body: {
      phoneNumber: sanitizedPhoneNumber,
      top5VanityNumbers: top3vanityNumbers,
    },
  };
};
