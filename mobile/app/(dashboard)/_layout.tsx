import { Stack } from 'expo-router';

export default function DashboardLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="[formularioId]/analitics" options={{ title: 'Analytics do formulario' }} />
		</Stack>
	);
}
