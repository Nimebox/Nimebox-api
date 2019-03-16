const getDomainName = url => {
  const regex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/gim
  return regex.exec(url)[1].toLowerCase()
}

const wait = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))

export default {
  getDomainName,
  wait
}
