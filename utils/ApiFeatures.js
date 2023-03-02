class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFieldes = ["page", "sort", "limit", "fields"];
    excludedFieldes.forEach((el) => delete queryObj[el]);

    console.log("this.queryString : ", this.queryString);
    console.log("queryObj : ", queryObj);
    console.log(" excludedFieldes : ", excludedFieldes);

    //2) advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b gte|gt|lte|lt \b/g, (match) => `$${match}`);
    console.log("JSON parse : ", JSON.parse(queryStr));
    console.log("quertStr : ", queryStr);
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Student.find(JSON.parse( queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort;
      console.log("sortBy :", sortBy);
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  field() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      console.log("fields :", fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
    }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    console.log("limit : ", limit);
    console.log("page : ", page);

    this.query = this.query.skip(skip).limit(limit);

    return this;
    }
};
module.exports = ApiFeatures;
