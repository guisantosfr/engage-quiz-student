function readingTime (text) {
    const noOfCharacters = text.replace(/\s/g, '').length;
    const readingTimeInSeconds = noOfCharacters / 7;

    return Math.ceil(readingTimeInSeconds / 10) * 10;
}

export default readingTime;