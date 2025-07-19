import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  Container,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

function App() {
  const [intensity, setIntensity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://api.carbonintensity.org.uk/intensity')
      .then((res) => res.json())
      .then((data) => {
        setIntensity(data.data[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch carbon intensity data');
        setLoading(false);
      });
  }, []);

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={6}>
        <Heading as="h1" size="xl" textAlign="center">
          UK Grid Carbon Intensity
        </Heading>
        {loading && <Spinner size="xl" />}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        {intensity && !loading && !error && (
          <Box p={6} borderRadius="md" boxShadow="md" bg="gray.50">
            <Text fontSize="2xl" fontWeight="bold">
              {intensity.intensity.actual} gCO₂/kWh
            </Text>
            <Text color="gray.500">
              Forecast: {intensity.intensity.forecast} gCO₂/kWh
            </Text>
            <Text color="gray.500">
              Date: {intensity.from.split('T')[0]} {intensity.from.split('T')[1].slice(0, 5)}
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default App;