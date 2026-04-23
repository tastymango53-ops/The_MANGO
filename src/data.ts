export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  originStory: string;
  tasteNotes: string[];
  weightOptions: number[]; // in kg
}

export const mockProducts: Product[] = [
  { 
    id: '1', 
    name: 'Alphonso', 
    price: 1500, 
    image: '/images/alphonso_mango_1776689722945.png', 
    description: 'The King of Mangoes, sweet and rich.',
    originStory: 'Grown in the coastal regions of Ratnagiri and Devgad in Maharashtra, the Alphonso is prized for its sunshine-yellow skin and creamy, non-fibrous pulp. It has been an international favorite for centuries.',
    tasteNotes: ['Rich', 'Creamy', 'Honey-like sweetness', 'Floral aroma'],
    weightOptions: [1, 2, 5]
  },
  { 
    id: '2', 
    name: 'Kesar', 
    price: 1200, 
    image: '/images/kesar_mango_1776689839624.png', 
    description: 'Queen of Mangoes, famous for its saffron color.',
    originStory: 'Hailing from the foothills of Girnar in Gujarat, the Kesar mango is known for its bright orange pulp and intense fragrance. It is often referred to as the "Queen of Mangoes" for its balanced sweetness.',
    tasteNotes: ['Saffron hue', 'Intense aroma', 'Balanced acidity', 'Velvety texture'],
    weightOptions: [1, 2, 5]
  },
  { 
    id: '3', 
    name: 'Dasheri', 
    price: 900, 
    image: '/images/dasheri_mango_1776689890684.png', 
    description: 'Sweet and aromatic, from the heart of North India.',
    originStory: 'Tracing its roots back to the 18th century in the gardens of the Nawabs of Lucknow, Dasheri is one of the oldest and most popular varieties in North India. It is long, slender, and incredibly sweet.',
    tasteNotes: ['Very sweet', 'Slender shape', 'Thin skin', 'Aromatic'],
    weightOptions: [1, 2, 5]
  },
  { 
    id: '4', 
    name: 'Langra', 
    price: 1000, 
    image: '/images/langra_mango_1776689910903.png', 
    description: 'Fleshy, fibrous-free and uniquely delicious.',
    originStory: 'Originating in Varanasi, the Langra mango stays green even when ripe. Legend says it was first cultivated by a "langra" (lame) sadu who planted a seed in his orchard. It is known for its distinct, slightly tangy flavor.',
    tasteNotes: ['Green skin', 'Tangy twist', 'Fiber-free', 'Refreshingly juicy'],
    weightOptions: [1, 2, 5]
  }
];
