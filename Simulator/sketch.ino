#include <LiquidCrystal.h>

// RS, E, D4, D5, D6, D7
LiquidCrystal lcd(14, 27, 26, 25, 18, 19);

int sensorPin = 34;  // Potentiometer input

void setup() {
  Serial.begin(115200);
  lcd.begin(16, 2);
}

void loop() {

  // Read potentiometer (0–4095)
  int sensorValue = analogRead(sensorPin);

  // Convert to current (0–10 Amps)
  float current = map(sensorValue, 0, 4095, 0, 10);

  // Fixed voltage (like real home supply)
  float voltage = 230;

  // Power calculation
  float power = voltage * current;

  // Energy (simplified)
  float energy = power * 0.001;

  // SERIAL OUTPUT
  Serial.println("----");
  Serial.print("Current: "); Serial.println(current);
  Serial.print("Power: "); Serial.println(power);
  Serial.print("Energy: "); Serial.println(energy);

  // LCD DISPLAY
  
lcd.setCursor(0, 0);
lcd.print("                "); // clear line manually

lcd.setCursor(0, 0);
lcd.print("V:");
lcd.print(voltage, 0);
lcd.print(" I:");
lcd.print(current, 1);

lcd.setCursor(0, 1);
lcd.print("                "); // clear second line

lcd.setCursor(0, 1);
lcd.print("P:");
lcd.print(power, 0);
lcd.print(" E:");
lcd.print(energy, 2);

  delay(300);
}