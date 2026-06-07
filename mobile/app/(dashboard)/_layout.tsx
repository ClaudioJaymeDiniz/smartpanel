import { COLORS } from '@/styles/colors';
import { Stack } from 'expo-router';

export default function DashboardLayout() {
	return (
		<Stack
	  screenOptions={{
		headerStyle: { 
		  backgroundColor: COLORS.background
		},
		headerTintColor: COLORS.primary,
		headerTitleStyle: { fontFamily: 'Jakarta-Bold' },
		headerBackTitle: 'Voltar',
	  }}
	>
			<Stack.Screen name="[formularioId]/analitics" options={{ title: 'Dashboard' }} />
		</Stack>
	);
}
