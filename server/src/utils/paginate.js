export const paginate = async (
  Model,
  filter,
  page = 1,
  limit = 10,
  populate = []
) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Model.find(filter).skip(skip).limit(limit).populate(populate),
    Model.countDocuments(filter),
  ]);
  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    limit,
  };
};
