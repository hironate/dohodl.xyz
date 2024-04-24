export const receiversQueryById = (id) => {
  return `query {  
      receivers(where:{vestingId:"${id}"}){
        address
        amount
        revoked
        released
      }
    }`
}
export const depositorsQuery = (account) => {
  return `query {
      vestingSchedules( where:{owner:"${account}"}){
        vestingId
        token
        totalAmount
        start
        cliff
        duration
        slicePeriod
        revocable
      }
    }`
}
export const depositorsQueryById = (account, id) => {
  return `query {
      vestingSchedules( where:{owner:"${account}" id:"${id}"}){
        vestingId
        token
        totalAmount
        start
        cliff
        duration
        slicePeriod
        revocable
      }
    }`
}
export const receiversQueryByAddress = (address) => {
  return `query {  
      receivers(where:{address:"${address}"}){
        vestingId{
        vestingId
        owner
        token
        totalAmount
        start
        cliff
        duration
        slicePeriod
        revocable
        }
        address
        amount
        revoked
        released
      }
    }`
}