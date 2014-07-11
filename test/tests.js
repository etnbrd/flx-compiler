module.exports = {

  // TODO this object should generate two things : the tests, and the roadmap.md file.
  counts : [
    {
      name : 'count1',
      desc : [
        "  The server reply a constant value to every request.",
       "   There isn't any variable used."
      ].join("\n"),
      expectations: ['42']
    },
    {
      name : 'count2',
      desc : [
        "  The server reply a constant value to every request,",
       "   using a variable declared **inside** the reply function.  ",
       "   This variable shouldn't be exchanged between fluxions,",
       "   as it's declared and used in the same function."
      ].join("\n"),
      expectations: ['42']
    },
    {
      name : 'count3',
      desc : [
        "  The server of problem #3 reply a constant value to every request,",
       "   using a variable declared **outside** the reply function.  ",
       "   This variable should be in the signature of the second fluxions."
      ].join("\n"),
      expectations: ['42']
    },
    {
      name : 'count4',
      desc : [
        "  The server of problem #4 reply a value incremented at every request,",
       "   using a variable declared outside the reply function.  ",
       "   This variable should be in the scope of the fluxions",
       "   as it is used only in this fluxion."
      ].join("\n"),
      expectations: ['42']
    },
    // {
    //   name : 'count5',
    //   desc : [
    //     "  The server of problem #1 reply a constant value to every request.",
    //    "   There isn't any variable used."
    //   ].join("\n"),
    //   expectations: ['42', '43']
    // },
    // {
    //   name : 'count6',
    //   desc : [
    //     "  Same with objects"
    //   ].join("\n"),
    //   expectations: ['42']
    // },
    // {
    //   name : 'count7',
    //   desc : [
    //     "  Same with arrays"
    //   ].join("\n"),
    //   expectations: ['42']
    // },
    // {
    //   name : 'count8',
    //   desc : [
    //     "  Same with requires"
    //   ].join("\n"),
    //   expectations: ['42']
    // }
  ]
};
