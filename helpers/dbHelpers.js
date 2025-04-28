const validateSaveParagraphContent = (data) => {
    let dataStatus = true, missedValue = null, 
        requiredKeys = ['paragraph', 'sub_title', 'paragraph_pos', 'sub_title_pos']
    ;
    const dataKeys = Object.keys(data);
    for (index = 0; index < requiredKeys.length; index++){
        if (!dataKeys.includes(requiredKeys[index])){
            dataStatus = false;
            missedValue = requiredKeys[index]
            break;
        }
    }
    return [dataStatus, missedValue]
}

const validateSavePageContent = (data, update = false) => {

    let dataStatus = true, missedValue = null;
    let requiredKeys = (update) ? ['user_id', 'title', 'update_at', 'page_number', 'paragraphContents'] : ['user_id', 'title', 'create_at', 'page_number', 'paragraphContents']
    const dataKeys = Object.keys(data);
    for (i = 0; i < dataKeys.length; i++){
        if (!dataKeys.includes(requiredKeys[i])){
            dataStatus = false;
            missedValue = requiredKeys[i];
            break;
        }
        if ( (requiredKeys[i] === 'paragraphContents') && (Array.isArray(data.paragraphContents))){
            for (let index = 0; index < data.paragraphContents.length; index++){
                let res = validateSaveParagraphContent(data.paragraphContents[index]);
                [dataStatus, missedValue] = res;
                if (dataStatus === false) break;
            }
        }
    }
    return [dataStatus, missedValue]
}

module.exports = {
    validatePageContent: validateSavePageContent,
    validateParagraphContent : validateSaveParagraphContent
}
