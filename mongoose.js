const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://admin:Password@dbcluster.we3eos7.mongodb.net/blogs?retryWrites=true&w=majority');
}

module.exports = {
    main
}