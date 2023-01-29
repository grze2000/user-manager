import { Message } from "discord.js";

const polishCharactersToReplace = {
  "ą": "a",
  "ć": "c",
  "ę": "e",
  "ł": "l",
  "ń": "n",
  "ó": "o",
  "ś": "s",
  "ź": "z",
  "ż": "z",
}

const replacePolishCharacters = (text: string) => {
  let newText = text.toLowerCase();
  for(const [key, value] of Object.entries(polishCharactersToReplace)) {
    newText = newText.replaceAll(key, value);
  }
  return newText;
}

export const validateCountdownMessage = async (msg: Message) => {
  const channel = await msg.channel.fetch();
  const previousMessage = (await channel.messages.fetch({
    limit: 1,
    before: msg.id,
  })).first();

  // If no previous message, skip conditions
  if(!previousMessage) return;

  // If the message is from the same author as the previous message
  if(msg.author.id === previousMessage.author.id) {
    await msg.delete();
    return;
  }

  // If the message does not match the regex
  const regexMatch = replacePolishCharacters(msg.content).match(/^([\d ]+) (\w)\w*(\w)$/i);
  if(!regexMatch) {
    await msg.delete();
    return;
  }

  // Error! Previous message does not match regex
  const previousRegexMatch = replacePolishCharacters(previousMessage.content).match(/^([\d ]+) (\w)\w*(\w)$/i);
  if(!previousRegexMatch) {
    console.log('Błąd poprzednia wiadomość nie spełnia wymagań');
    return;
  }

  // If the number is not one more than the number of the previous message
  if(parseInt(regexMatch[1].replaceAll(' ', '')) !== parseInt(previousRegexMatch[1].replaceAll(' ', '')) + 1) {
    await msg.delete();
    return;
  }

  // If the first letter is diferent than the last letter of the previous message
  if(regexMatch[2] !== previousRegexMatch[3]) {
    await msg.delete();
    return;
  }  
};
