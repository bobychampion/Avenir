const JSS_IMAGES: Record<string, string> = {
  JSS_SCIENCE_ANALYTICAL: 'Science & Analytical.png',
  JSS_ARTS_HUMANITIES: 'Arts & Humanities.png',
  JSS_COMMERCIAL_BUSINESS: 'Commercial & Business.png',
  JSS_CREATIVE_DESIGN: 'Creative & Design.png',
  JSS_HYBRID: 'Hybrid : Multidisciplinary.png'
};

export const getClusterImage = (clusterId?: string | null) => {
  if (!clusterId) return null;
  const file = JSS_IMAGES[clusterId];
  if (!file) return null;
  return `/careers/Jss/${encodeURIComponent(file)}`;
};
