const fallbackData = {
  Features: [
    {
      id: 1,
      description: "Deep water faunal crust & sponge community complex",
      eunis2022code: "MD121",
      name: "Deep sponge-covered reef",
      color: "blue",
    },
    {
      id: 2,
      description:
        "Deep water sand dominated by bivalves and polychaetes community complex",
      eunis2022code: "MC5212",
      name: "Deep sandy seabed with shellfish and worms",
    },
    {
      id: 3,
      description:
        "Exposed to moderately exposed subtidal reef community complex",
      eunis2022code: "MC12222",
      name: "Wave-washed rocky seabed reef",
      color: "darkblue",
    },
    {
      id: 4,
      description: "Intertidal reef community complex",
      eunis2022code: "MA124",
      name: "Rocky shore reef (between tides)",
      color: "slategrey",
    },
    {
      id: 5,
      description: "Intertidal sand with polychaetes community complex",
      eunis2022code: "MA5241",
      name: "Worm-rich sandy shore",
      color: "tan",
    },
    {
      id: 6,
      description: "Laminaria-dominated community complex",
      eunis2022code: "MB121A1",
      name: "Kelp forest",
      color: "forestgreen",
    },
    {
      id: 7,
      description: "Maërl-dominated community complex",
      eunis2022code: "MB4211",
      name: "Maërl gravel seabed (living pink seaweed gravel)",
      color: "pink",
    },
    {
      id: 8,
      description:
        "Maërl-dominated community complex / Zostera-dominated community complex",
      eunis2022code: "MB5223",
      name: "Maërl gravel with seagrass beds",
      color: "lightgreen",
    },
    {
      id: 9,
      description: "Mixed sediment dominated by polychaetes community complex",
      eunis2022code: "MB42",
      name: "Mixed seabed with lots of worms",
      color: "beige",
    },
    {
      id: 10,
      description: "Pachycerianthus multiplicatus-dominated community",
      eunis2022code: "MC4211",
      name: "Burrowing anemone mud habitat",
      color: "brown",
    },
    {
      id: 11,
      description: "Sand with nemerteans and crustaceans community complex",
      eunis2022code: "MB5233",
      name: "Shallow sand with worms and small crustaceans",
      color: "khaki",
    },
    {
      id: 12,
      description: "Subtidal sponge and ascidian community complex",
      eunis2022code: "MC12411",
      name: "Sponge and sea-squirt reef",
      color: "purple",
    },
    {
      id: 13,
      description: "Zostera-dominated community complex",
      eunis2022code: "MB5223",
      name: "Seagrass meadow (eelgrass bed)",
      color: "green",
    },
    {
      id: 14,
      description: "MC52: Atlantic circalittoral sand",
      eunis2022code: "MC52",
      name: "Deep sandy seabed",
      color: "lightyellow",
    },
    {
      id: 15,
      description: "MC32: Atlantic circalittoral coarse sediment",
      eunis2022code: "MC32",
      name: "Deep gravel and shell seabed",
      color: "grey",
    },
    {
      id: 16,
      description: "MC12: Atlantic circalittoral rock",
      eunis2022code: "MC12",
      name: "Deep rocky reef",
      color: "darkgrey",
    },
    {
      id: 17,
      description: "MD52: Atlantic offshore circalittoral sand",
      eunis2022code: "MD52",
      name: "Offshore deep sand seabed",
      color: "palegoldenrod",
    },
    {
      id: 18,
      description: "MB12: Atlantic infralittoral rock",
      eunis2022code: "MB12",
      name: "Shallow rocky reef",
      color: "steelblue",
    },
    {
      id: 19,
      description: "MC62: Atlantic circalittoral mud",
      eunis2022code: "MC62",
      name: "Deep muddy seabed",
      color: "saddlebrown",
    },
    {
      id: 20,
      description: "MB52: Atlantic infralittoral sand",
      eunis2022code: "MB52",
      name: "Shallow sandy seabed",
      color: "wheat",
    },
    {
      id: 21,
      description: "MB42: Atlantic infralittoral mixed sediment",
      eunis2022code: "MB42",
      name: "Shallow mixed sand and gravel seabed",
      color: "burlywood",
    },
    {
      id: 22,
      description: "MD62: Atlantic offshore circalittoral mud",
      eunis2022code: "MD62",
      name: "Offshore deep muddy seabed",
      color: "darkbrown",
    },
    {
      id: 23,
      description: "MB32: Atlantic infralittoral coarse sediment",
      eunis2022code: "MB32",
      name: "Shallow gravel and shell seabed",
      color: "lightgrey",
    },
    {
      id: 24,
      description: "MC42: Atlantic circalittoral mixed sediment",
      eunis2022code: "MC42",
      name: "Deep mixed sand and gravel seabed",
      color: "rosybrown",
    },
    {
      id: 25,
      description: "MD12: Atlantic offshore circalittoral rock",
      eunis2022code: "MD12",
      name: "Offshore deep rocky reef",
      color: "midnightblue",
    },
    {
      id: 26,
      description: "MB62: Atlantic infralittoral mud",
      eunis2022code: "MB62",
      name: "Shallow muddy seabed",
      color: "olive",
    },
  ],
  Activities: [
    {
      id: 27,
      name: "Dredging (shellfish)",
      color: "#8B0000",
      description:
        "Mechanical removal of shellfish from the seabed using dredging gear.",
    },
    {
      id: 28,
      name: "Finfish aquaculture",
      color: "#20B2AA",
      description:
        "Farming of finfish species in marine or coastal environments.",
    },
    {
      id: 29,
      name: "Harvesting - seaweed and other sea-based food (bird eggs, shellfish, etc.)",
      color: "#6B8E23",
      description:
        "Collection of seaweed and other marine-based food resources from coastal areas.",
    },
    {
      id: 30,
      name: "Demersal trawling",
      color: "#A52A2A",
      description:
        "Bottom trawling targeting species that live on or near the seabed.",
    },
    {
      id: 31,
      name: "Line fishing",
      color: "#1E90FF",
      description: "Fishing method using baited hooks attached to lines.",
    },
    {
      id: 32,
      name: "Set (fixed) net fishing",
      color: "#4682B4",
      description:
        "Fishing using stationary nets placed in specific locations.",
    },
    {
      id: 33,
      name: "Shellfish aquaculture: Suspended rope/net culture",
      color: "#9370DB",
      description:
        "Shellfish farming method where shellfish are grown on suspended ropes or nets.",
    },
    {
      id: 34,
      name: "Shellfish aquaculture: Trestle culture",
      color: "#BA55D3",
      description:
        "Shellfish farming method using trestles or racks in intertidal areas.",
    },
    {
      id: 35,
      name: "Traps",
      color: "#CD853F",
      description:
        "Fishing method using baited traps or pots to capture marine species.",
    },
    {
      id: 36,
      name: "Vessel moorings",
      color: "#708090",
      description:
        "Anchoring or securing vessels in a fixed position in coastal or marine areas.",
    },
    {
      id: 37,
      name: "Vessel movements",
      color: "#2F4F4F",
      description:
        "Navigation and transit of vessels through marine or coastal waters.",
    },
    {
      id: 38,
      name: "Leisure (e.g. swimming, rock pooling)",
      color: "#FF69B4",
      description:
        "Recreational activities conducted in coastal and marine environments.",
    },
  ],
};

export default fallbackData;
