export const getMeterById = async (meterId: string): Promise<Meter> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST || 'http://10.8.0.99:8000'}/api/v1/meters/${meterId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch meter data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching meter:', error);
        throw error;
    }
};