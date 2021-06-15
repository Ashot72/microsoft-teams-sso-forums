/* eslint-disable */
const emailCard = require("./EmailCard.json")

const ErofileCard = (mail) => {
    emailCard.body[1].value = mail
    return emailCard
}

export default ErofileCard