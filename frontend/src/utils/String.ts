export const toShortAddress = (address = "", num = 5) => {
  return address
    ? `${address.substring(0, num)}...${address.substring(
        address.length - num,
        address.length,
      )}`
    : "";
};

export const toShortString = (string = "", num = 5) => {
  return string
    ? string.length > 5
      ? `${string.substring(0, num)}...`
      : string
    : "";
};
