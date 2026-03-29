export const paginate = async (
  Model,
  filter,
  page = 1,
  limit = 10,
  populate = [],
  sort = { created_at: -1 }, // Added default sort
  select = '-passwordHash' // Added default select to exclude password
) => {
  const skip = (page - 1) * limit;
  const [list, total] = await Promise.all([
    Model.find(filter)
      .select(select) // Apply selection
      .sort(sort) // Apply sorting
      .skip(skip)
      .limit(limit)
      .populate(populate),
    Model.countDocuments(filter),
  ]);
  return {
    list,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    limit: parseInt(limit),
  };
};
