export const parseStorageTemperature = (req, res, next) => {
  if (
    req.body["storageTemperature[min]"] !== undefined ||
    req.body["storageTemperature[max]"] !== undefined
  ) {
    req.body.storageTemperature = {
      min: req.body["storageTemperature[min]"]
        ? Number(req.body["storageTemperature[min]"])
        : undefined,
      max: req.body["storageTemperature[max]"]
        ? Number(req.body["storageTemperature[max]"])
        : undefined,
    };
    delete req.body["storageTemperature[min]"];
    delete req.body["storageTemperature[max]"];
  }
  next();
};
