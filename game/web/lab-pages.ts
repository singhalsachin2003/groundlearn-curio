// Text for the web lab pages (groundlearn.com/play/curio-island/labs/<id>/), one entry per lab.
// The lab's name, age band, subject, level count and worked example come from the game itself
// (labs.ts, examples.ts); this file adds what a parent or teacher reads before pressing Play.
//   about: what the child does in the lab (2-3 sentences)
//   why:   a "why it works" picture to remember the idea by (an analogy, not the full science)
//   learn: three things a child practises or finds out
// Keep the science exact: these pages are what search engines and parents will quote.

export interface LabPage { about: string; why: string; learn: [string, string, string] }

export const LAB_PAGES: Record<string, LabPage> = {
  // ---------- For every age ----------
  colour: {
    about: 'Mix paints and mix coloured light in a studio, and find out why the two give different answers. Every new colour goes into a collection of discoveries.',
    why: 'Paint is like a sieve: every paint you add soaks up (subtracts) more of the light, so mixes get darker. Light is like adding torches together: every beam you add puts more light in, so red and green light make a bright yellow.',
    learn: ['Primary and secondary colours in paint', 'Why mixing light (additive) differs from mixing paint (subtractive)', 'How screens make every colour from red, green and blue'],
  },

  // ---------- Inventor (10+) ----------
  forge: {
    about: 'Build real molecules atom by atom, from water and carbon dioxide to methane and beyond. Each atom can only hold a set number of bonds, so the puzzle is getting every "hand" filled.',
    why: 'Think of atoms as people with a fixed number of hands: hydrogen has one, oxygen two, nitrogen three, carbon four. A molecule is finished when every hand is holding another hand.',
    learn: ['Chemical formulas such as H₂O, CO₂ and CH₄', 'Valency: how many bonds each element makes', 'Single, double and triple bonds'],
  },
  react: {
    about: 'Mix, heat and test everyday chemicals in a virtual lab: make things fizz, change colour or give off gas, then use simple tests to find out what was made.',
    why: 'A reaction is like a dance where partners swap: the atoms stay the same, but they leave one partner and hold hands with another, so you end up with brand-new substances.',
    learn: ['Signs of a chemical reaction: gas, colour change, heat', 'Acids, bases and the limewater test for carbon dioxide', 'Atoms are rearranged in a reaction, not created or destroyed'],
  },
  launch: {
    about: 'Set the angle and speed of a launcher to land a ball on target. Each level asks for a distance, and the child works out the launch that gets there.',
    why: 'A thrown ball is like a car that drives forward at a steady speed while gravity keeps pulling it down. Too steep and it spends its speed going up; too flat and it lands early. Halfway, 45°, goes farthest.',
    learn: ['Gravity pulls everything down at the same rate', 'Why 45° gives the longest throw on flat ground', 'Using a formula (distance = speed² ÷ 9.8 at 45°) to plan a launch'],
  },
  light: {
    about: 'Turn mirrors to steer a laser beam around obstacles and light up crystals. Each turn of a mirror swings the beam, so planning the angles is the puzzle.',
    why: 'Light bounces off a mirror like a ball off a wall: it leaves at the same angle it arrived. Turn the mirror a little and the beam swings twice as far.',
    learn: ['The law of reflection: angle in equals angle out', 'Turning a mirror by θ turns the reflected beam by 2θ', 'Light travels in straight lines'],
  },
  circuit: {
    about: 'Connect batteries, wires, switches and bulbs until every bulb lights. Later levels add series and parallel circuits and things that do or do not conduct.',
    why: 'Electricity in a circuit is like water in a loop of pipe: it only flows if the loop is complete. A switch is a tap, a battery is a pump, and a bulb glows when the flow runs through it.',
    learn: ['A circuit must be a complete loop', 'Conductors (metals) and insulators (wood, rubber, plastic)', 'Series and parallel circuits'],
  },
  mach: {
    about: 'Lift heavy loads with levers, pulleys and ramps. The child moves pivots and chooses machines so a small push can move a big weight.',
    why: 'Simple machines trade distance for force, like taking a long gentle path up a hill instead of a short steep one: you walk farther, but each step is easier.',
    learn: ['Levers: effort × distance = load × distance', 'How pulleys and ramps reduce the force needed', 'Machines make work easier, not smaller'],
  },
  balance: {
    about: 'Solve algebra puzzles on a pan balance. Mystery bags hide the value of x, and the child keeps the scale level while removing and splitting blocks until each bag is known.',
    why: 'An equation is a see-saw that must stay level: whatever you do to one side, you must do to the other. Take 3 blocks off both pans and it still balances.',
    learn: ['What an equation means', 'Solving for x by doing the same to both sides', 'Two-step equations such as 2x + 3 = 11'],
  },
  graph: {
    about: 'Draw straight lines on a coordinate grid to catch every gem. The child sets the slope and the starting point to make the line pass through the gems.',
    why: 'A straight line is a staircase with the same step everywhere: the slope says how many steps up for each step across, and c says which floor you start on.',
    learn: ['Plotting points (x, y)', 'Slope as "up ÷ across"', 'Writing a line as y = mx + c'],
  },
  nets: {
    about: 'Fold flat patterns of squares into cubes and decide which patterns really make a cube. Later levels check which faces end up opposite each other.',
    why: 'A cube net is a cardboard box that has been cut open and pressed flat. Fold the flaps back up like little doors, and the box closes only if no flaps overlap and none are missing.',
    learn: ['A cube has 6 faces', 'Which flat nets fold into a cube', 'Picturing 3D shapes from 2D drawings'],
  },
  genes: {
    about: 'Grow pea plants and cross them, the way Gregor Mendel did, to see how flower colour and other traits pass from parents to babies.',
    why: 'Each parent passes on one of its two copies of a gene, like each parent putting one card into the baby\'s hand. A dominant card (big P) shows whenever it is there; a recessive one (small p) shows only when both cards are small.',
    learn: ['Genes come in pairs, one from each parent', 'Dominant and recessive traits', 'Why two purple Pp parents give 3 purple to 1 white'],
  },
  body: {
    about: 'Travel through the human body: follow a red blood cell round the heart and lungs, and visit the organs that keep us alive.',
    why: 'Your blood is a delivery service on a two-loop road: one loop goes to the lungs to pick up oxygen, the other carries it to the rest of the body, and the heart is the pump that keeps both loops moving.',
    learn: ['The heart has two sides and pumps blood in two loops', 'How blood picks up oxygen in the lungs', 'What the main organs do'],
  },
  eco: {
    about: 'Run a small world of grass, deer and tigers over many seasons. Change the numbers and watch the populations rise and fall until they reach a balance.',
    why: 'An ecosystem is like a see-saw with many seats: too many deer and the grass runs out; too many tigers and the deer disappear. Every animal and plant keeps the others in check.',
    learn: ['Food chains: producers, herbivores and predators', 'How predators keep populations in balance', 'What happens when one species is removed'],
  },
  matter: {
    about: 'Heat and cool water and watch its particles change: ice jiggles in place, water slides around and steam flies apart.',
    why: 'Particles are like people in a room: when it is cold they stand still holding hands (solid), warmer and they shuffle about (liquid), hot enough and they run off in every direction (gas).',
    learn: ['Solid, liquid and gas in terms of particles', 'Melting at 0 °C and boiling at 100 °C (for water)', 'Condensing and freezing as the reverse changes'],
  },
  fraction: {
    about: 'Slice pizzas, share out portions and mix colours in a ratio. The child shows fractions by tapping slices and keeps mixtures in the right proportion.',
    why: 'A fraction is a pizza order: the bottom number says how many equal slices the pizza is cut into, the top says how many you take. A ratio is a recipe: 2 scoops of red for every 3 of blue, however big the batch.',
    learn: ['Fractions as parts of a whole', 'Equivalent fractions and ratios (2 : 3 = 4 : 6)', 'Using ratio to scale a mixture'],
  },
  sound: {
    about: 'Tune a sound wave by changing its frequency and amplitude, and hear how pitch and loudness change. Later levels connect frequency and wavelength.',
    why: 'Sound is like ripples on a pond made by a tapping finger: tap faster and the ripples are closer together (higher pitch); tap harder and they are taller (louder).',
    learn: ['Pitch depends on frequency (hertz)', 'Loudness depends on amplitude', 'Wavelength = speed of sound ÷ frequency'],
  },
  cell: {
    about: 'Build animal and plant cells part by part, matching each part to its job, then watch microbes grow and find out what slows them down.',
    why: 'A cell is a tiny factory: the nucleus is the office giving instructions, mitochondria are the power station, the membrane is the gate with guards, and a plant cell adds solar panels (chloroplasts) and a brick wall (cell wall).',
    learn: ['The parts of animal and plant cells', 'What the nucleus, membrane and mitochondria do', 'How microbes multiply and how we slow them down'],
  },
  moon: {
    about: 'Move the Moon round the Earth and see why its shape seems to change through the month, from new moon to full moon and back.',
    why: 'Hold a ball near a lamp and walk around it: one half of the ball is always lit, but how much of that bright half you see depends on where the ball is. The Moon is the ball and the Sun is the lamp.',
    learn: ['The Moon does not make its own light', 'Phases come from how much of the lit half we see', 'Why the cycle takes about a month'],
  },
  area: {
    about: 'Build shapes on a squared grid and measure their area and perimeter. Some levels ask for the same area with different perimeters.',
    why: 'Area is how much carpet a room needs; perimeter is how much skirting board goes round the edge. Two rooms can need the same carpet but very different lengths of skirting.',
    learn: ['Area as a count of unit squares', 'Perimeter as the distance round the edge', 'Shapes with the same area can have different perimeters'],
  },
  decimal: {
    about: 'Shade a hundred-square grid to show decimals and percentages, and move between 0.5, 50% and one half.',
    why: 'A hundred grid is a rupee in paise: each square is one paisa of the hundred. 0.25 of the grid is 25 squares, which is 25 per cent, which is a quarter.',
    learn: ['Tenths and hundredths', 'Converting between decimals, fractions and percentages', 'Comparing decimals'],
  },
  pythag: {
    about: 'Change the two short sides of a right-angled triangle and watch the squares built on each side. The areas show Pythagoras\' theorem at work.',
    why: 'Imagine the square on each side is a tray of sand. Pour the sand from the two small trays into the big one on the longest side, and it fills it exactly, every time the triangle has a right angle.',
    learn: ['Right-angled triangles and the hypotenuse', 'a² + b² = c²', 'Finding a missing side'],
  },
  ph: {
    about: 'Add acid and base drops to a liquid and watch an indicator change colour as the pH moves along the scale from strong acid to strong base.',
    why: 'pH is a thermometer for "sourness": low numbers are acids like lemon juice, 7 is neutral like pure water, high numbers are bases like soap. The indicator\'s colour is the reading on the thermometer.',
    learn: ['The pH scale and neutral 7', 'Acids lower pH, bases raise it', 'Indicators show pH by colour'],
  },
  filter: {
    about: 'Switch red, green and blue lamps on and off and see how coloured objects change. A red apple can look black, and a white shirt can look any colour.',
    why: 'Objects are picky mirrors: a red apple bounces back only red light and soaks up the rest. If no red light shines on it, there is nothing for it to bounce back, so it looks black.',
    learn: ['We see colour from the light an object reflects', 'Why objects change colour under coloured light', 'White light contains red, green and blue'],
  },
  angle: {
    about: 'Turn an arm to make a target angle by eye, with no protractor, then check how close you came. The aim is a good sense of what 30°, 90° or 135° looks like.',
    why: 'Angles are slices of a round cake: a right angle (90°) is a quarter of the cake, a straight line (180°) is half, and a full turn (360°) is the whole cake.',
    learn: ['Acute, right, obtuse and reflex angles', 'Estimating angles by eye', 'A full turn is 360°'],
  },

  // ---------- Tinkerer (7-10) ----------
  atom: {
    about: 'Snap atoms together to build simple molecules such as water, oxygen and carbon dioxide. Each atom shows how many hands it has to hold.',
    why: 'Atoms are like friends who hold hands: hydrogen has one hand, oxygen two and carbon four. A molecule is finished when every hand is holding another.',
    learn: ['Everything is made of atoms', 'Simple molecules like H₂O and CO₂', 'Each kind of atom makes a set number of bonds'],
  },
  kitchen: {
    about: 'Mix safe kitchen things such as baking soda, vinegar, lemon and red-cabbage juice, guess what will happen, then see if you were right.',
    why: 'Red-cabbage juice is a colour spy: it turns pink when it meets an acid like lemon and green-blue when it meets a base like baking soda. Fizz is a new gas being made, the same carbon dioxide that is in fizzy drinks.',
    learn: ['Signs of a chemical change: fizz, colour, smell', 'Acids and bases at home', 'Making a prediction and testing it'],
  },
  mirror: {
    about: 'Place mirrors on a grid to bounce a light beam around corners until it reaches the star. Each level needs a cleverer path.',
    why: 'A slanted mirror is a corner in a road: the beam drives straight until it reaches the mirror, then turns 90° and carries on straight again.',
    learn: ['Light travels in straight lines', 'Mirrors change the direction of light', 'Planning a path step by step'],
  },
  coord: {
    about: 'Plot points on a grid in order and join them to reveal a picture, such as a house or a boat.',
    why: 'Coordinates are a street address on a map: the first number tells you how far to walk along the road, the second how many floors to go up.',
    learn: ['Reading and plotting (x, y) coordinates', '"Along the corridor, then up the stairs"', 'Following steps in order'],
  },
  pea: {
    about: 'Choose two parent pea plants, cross them and predict the flower colours of the babies, then check the result.',
    why: 'Each parent gives the baby one of its two colour cards. Purple (big P) is a loud card that always shows; white (small p) only shows when the baby has two white cards.',
    learn: ['Babies get features from both parents', 'Dominant and hidden (recessive) features', 'Predicting results before testing'],
  },
  chain: {
    about: 'Build food chains for a meadow, a pond and the sea by choosing who eats whom, starting from a plant that makes its own food.',
    why: 'A food chain is a relay race for energy: the Sun hands energy to the plant, the plant to the animal that eats it, and so on along the arrows.',
    learn: ['Producers and consumers', 'Arrows show the direction energy flows', 'Herbivores, carnivores and predators'],
  },
  groups: {
    about: 'Fill baskets with equal numbers of fruit to show multiplication as equal groups, such as 3 baskets of 4.',
    why: 'Multiplication is a shortcut for adding the same number again and again: 3 baskets of 4 apples is 4 + 4 + 4, which is 3 × 4.',
    learn: ['Multiplication as equal groups', 'Times tables in pictures', 'Linking repeated addition and multiplication'],
  },
  ladoo: {
    about: 'Take a fraction of a box of ladoos, such as 1/2 of 8 or 3/4 of 12, by tapping the right number of sweets.',
    why: 'To find a fraction of a box, share the box between as many friends as the bottom number, then take as many friends\' shares as the top number.',
    learn: ['Fractions of a set', 'Dividing into equal parts', 'Finding 1/2, 1/3 and 3/4 of a number'],
  },
  symmetry: {
    about: 'Colour squares on one side of a mirror line so the picture matches the other side, like a reflection.',
    why: 'Put a mirror on the dotted line: the coloured side should appear on the other side, each square the same distance from the line, just flipped.',
    learn: ['Lines of symmetry', 'Reflections and mirror images', 'Counting distance from a line'],
  },
  water: {
    about: 'Put the steps of the water cycle in order, from the sea to the clouds to rain and back again.',
    why: 'The water cycle is the Earth\'s recycling machine: the Sun lifts water up as invisible vapour, it cools into clouds, falls as rain and runs back to the sea to start again.',
    learn: ['Evaporation, condensation and rain', 'Water keeps moving round and round', 'Putting events in order'],
  },
  magnet: {
    about: 'Guess which everyday objects a magnet will pull, then test them. Some metals surprise everyone.',
    why: 'A magnet is fussy about who it picks up: it grabs iron and steel (and nickel), but it ignores wood, plastic, glass and even metals like gold, copper and aluminium.',
    learn: ['Magnetic and non-magnetic materials', 'Not all metals are magnetic', 'Testing a guess'],
  },
  life: {
    about: 'Put the stages of a life cycle in order, from egg to grown-up, for butterflies, frogs, chickens and plants.',
    why: 'A life cycle is a circle, not a line: the grown-up makes eggs or seeds, and the story begins again.',
    learn: ['Life cycles of insects, amphibians, birds and plants', 'Metamorphosis (caterpillar to butterfly, tadpole to frog)', 'Sequencing stages'],
  },
  senses: {
    about: 'Match everyday things to the sense that notices them: sight, hearing, smell, taste or touch.',
    why: 'Your senses are your body\'s five reporters: eyes report what things look like, ears what they sound like, nose, tongue and skin how they smell, taste and feel. Your brain reads all the reports.',
    learn: ['The five senses and their organs', 'Which sense notices which thing', 'Senses help us learn about the world'],
  },
  plants: {
    about: 'Match the parts of a plant to their jobs: roots, stem, leaves and flowers.',
    why: 'A plant is a team: roots are the straws that drink water, the stem is the lift that carries it up, leaves are the kitchens that make food from sunlight, and flowers make the seeds for new plants.',
    learn: ['The parts of a plant', 'What each part does', 'Plants make their own food from sunlight'],
  },
  materials: {
    about: 'Find objects that are see-through, bendy, waterproof or metal, and learn why we choose different materials for different jobs.',
    why: 'Choosing a material is like choosing shoes: rain boots for puddles, sandals for the beach. A window is glass because it is see-through; a raincoat is plastic because it keeps water out.',
    learn: ['Properties of materials', 'Matching materials to jobs', 'Sorting and checking choices'],
  },
  shapes: {
    about: 'Hunt for flat and solid shapes among everyday things, counting corners and sides and spotting which ones roll.',
    why: 'Shapes are hiding everywhere: a coin is a circle, a dice is a cube, a ball is a sphere. Corners and flat faces stop things rolling; curved faces let them roll.',
    learn: ['2D and 3D shapes', 'Sides, corners (vertices) and faces', 'Which shapes roll or stack'],
  },
  forces: {
    about: 'Sort everyday actions into pushes and pulls, and see how forces start, stop and change the shape of things.',
    why: 'A force is a push or a pull, like the nudge you give a swing. Gravity is an invisible pull that keeps bringing everything back down to the ground.',
    learn: ['Forces are pushes and pulls', 'Forces can start, stop, turn or squash things', 'Gravity pulls things down'],
  },
  coins: {
    about: 'Make exact amounts with rupee coins, sometimes with a limit on how many coins you can use.',
    why: 'Making money is like building with blocks of different sizes: use the biggest blocks first, then fill the gap with smaller ones until it is exactly right.',
    learn: ['Recognising coin values', 'Adding to make an exact total', 'Using the fewest coins'],
  },

  // ---------- Explorer (4-7) ----------
  fizz: {
    about: 'Drop two things into a bowl and watch what happens: bubbles, fizz, foam or colour. Little ones cannot get it wrong; nothing happens, and they try again.',
    why: 'Some things change when they meet, like soap meeting water to make bubbles, or vinegar meeting baking soda to make fizzy gas.',
    learn: ['Mixing things can make something new', 'Watching closely and saying what happened', 'Trying again when nothing happens'],
  },
  seesaw: {
    about: 'Put animals on a see-saw until both sides are level, counting the dots that show how heavy each one is.',
    why: 'A see-saw is like sharing fairly: it only goes level when both sides have the same amount, so two dogs of 2 dots balance one elephant of 4.',
    learn: ['Comparing heavier and lighter', 'Adding small numbers to match', 'The idea of balance'],
  },
  bulb: {
    about: 'Put different things into a gap in a wire and see which ones light the bulb.',
    why: 'Electricity is like water that needs a path: metal things make a bridge across the gap so it can flow and the bulb lights; wood, cloth and plastic block the path.',
    learn: ['Some things let electricity through', 'Metals conduct; wood and cloth do not', 'Testing one thing at a time'],
  },
  scales: {
    about: 'Add fruit to one side of the scales until both sides show the same number.',
    why: 'Equal means "the same on both sides", like two friends with the same number of sweets.',
    learn: ['Counting on', 'Matching two numbers', 'The meaning of "equal"'],
  },
  baby: {
    about: 'Match baby animals to their mums: a calf to a cow, a puppy to a dog, a lamb to a sheep.',
    why: 'Babies grow up to look like their parents, even when they look a bit different when they are small, like a tadpole and a frog.',
    learn: ['Names of baby animals', 'Babies grow into grown-ups like their parents', 'Matching and sorting'],
  },
  pond: {
    about: 'Feed the pond animals the food they really eat. The right food is gobbled up and silly food is refused.',
    why: 'Every animal has its own menu: frogs catch flies, ducks nibble weeds and fish eat small bugs.',
    learn: ['What different animals eat', 'Living things need food', 'Sorting by a rule'],
  },
  share: {
    about: 'Share a pile of sweets so that every friend ends up with the same number.',
    why: 'Fair sharing is dealing cards: give one to each friend in turn, round and round, until the pile is empty.',
    learn: ['Sharing equally', 'Early division', 'Checking that everyone has the same'],
  },
  clock: {
    about: 'Read the time on an analogue clock, starting with o\'clock times.',
    why: 'A clock is like a race track with two runners: the short hand walks slowly and shows the hour; the long hand runs all the way round each hour.',
    learn: ['Hour and minute hands', 'Telling the time to the hour', 'Numbers 1 to 12 on a clock face'],
  },
  pattern: {
    about: 'Look at a string of beads and choose what comes next in the pattern.',
    why: 'A pattern is like a song chorus that repeats: once you hear which part repeats, you can sing what comes next.',
    learn: ['Spotting repeating patterns', 'Predicting what comes next', 'Colours and shapes'],
  },
  daynight: {
    about: 'Sort pictures into day things and night things: the Sun, the Moon, stars, owls and more.',
    why: 'As the Earth spins, our side faces the Sun (day) and then turns away from it (night), like turning your face towards and away from a lamp.',
    learn: ['Day and night', 'What we see in the sky', 'Animals that are awake at night'],
  },
  mix: {
    about: 'Mix two paints to make the colour shown at the top, such as orange or green.',
    why: 'Paint colours are like friends who make something new together: red and yellow make orange, blue and yellow make green, red and blue make purple.',
    learn: ['Primary colours: red, yellow and blue', 'Making orange, green and purple', 'Naming colours'],
  },
  states: {
    about: 'Sort everyday things into solids that keep their shape and liquids that pour.',
    why: 'A solid is like a toy block: it keeps its shape wherever you put it. A liquid is like juice: it takes the shape of the cup it is poured into.',
    learn: ['Solids and liquids', 'Keeping shape versus pouring', 'Sorting by a property'],
  },
  float: {
    about: 'Guess whether a thing will float or sink, then drop it in the water and see.',
    why: 'Water pushes up on everything. Light things for their size, like a leaf or a cork, get pushed up and float; heavy things for their size, like a stone, sink.',
    learn: ['Floating and sinking', 'Making a guess, then testing it', 'Heavy and light for their size'],
  },
  count: {
    about: 'Count the things in a picture and tap the matching number.',
    why: 'Counting is like giving each thing a ticket with a number: the last ticket you give out tells you how many there are.',
    learn: ['Counting objects one by one', 'Matching a number to a quantity', 'Numbers up to 10 and beyond'],
  },
  home: {
    about: 'Match animals to where they live: a fish in the sea, a monkey in a tree, a bird in a nest.',
    why: 'Every animal\'s home gives it what it needs, like your house gives you a bed, food and shelter: water for fish, trees for monkeys.',
    learn: ['Animal homes (habitats)', 'Animals need food, water and shelter', 'Matching and sorting'],
  },
};
