const getFirstNames = (fullName) => {
    const names = fullName.split(' ');
    const prepositions = ['de', 'da', 'do', 'dos', 'das'];

    // Verifica se o segundo nome é uma preposição
    if (prepositions.includes(names[1]?.toLowerCase())) {
        return names.slice(0, 3).join(' ');
    }

    // Caso contrário, retorne apenas os dois primeiros nomes
    return names.slice(0, 2).join(' ');
}

export default getFirstNames;