const JSS_IMAGES: Record<string, string> = {
  JSS_SCIENCE_ANALYTICAL: 'science-analytical.png',
  JSS_ARTS_HUMANITIES: 'arts-humanities.png',
  JSS_COMMERCIAL_BUSINESS: 'commercial-business.png',
  JSS_CREATIVE_DESIGN: 'creative-design.png',
  JSS_HYBRID: 'hybrid-multidisciplinary.png'
};

export const getClusterImage = (clusterId?: string | null) => {
  if (!clusterId) return null;
  const file = JSS_IMAGES[clusterId];
  if (!file) return null;
  return `/careers/Jss/${file}`;
};
