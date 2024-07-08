import tkinter as tk
from tkinter import ttk, messagebox

HOURS_IN_YEAR = 8760
KM_TO_MILES = 0.621371
WEEKS_IN_YEAR = 52

class CarbonImpactCalculator:
    def __init__(self, root):
        self.root = root
        self.root.title("Carbon Impact Calculator")
        self.root.geometry("600x600")

        self.emission_factors = {
            'devices': {
                'smartphone': {'usage': 125, 'embodied': 50},  # kgCO2e per year
                'laptop': {'usage': 200, 'embodied': 200},
                'desktop': {'usage': 500, 'embodied': 350}
            },
            'travel': {
                'car': 0.2,       # kgCO2e per mile
                'train': 0.05     # kgCO2e per mile
            },
            'emails': {
                'simple': 0.004,       # kgCO2e per email without attachment
                'attachment': 0.05     # kgCO2e per email with attachment
            }
        }

        self.inputs = {
            'devices': {
                'fields': [('Device Type', ['smartphone', 'laptop', 'desktop']), ('Hours/Week',), ('Years',)],
                'listbox': None
            },
            'travel': {
                'fields': [('Travel Mode', ['car', 'train']), ('Distance (km/week)',)],
                'listbox': None
            },
            'emails': {
                'fields': [('Simple Emails/Week',), ('Emails with Attachment/Week',)],
                'listbox': None
            }
        }

        self.create_widgets()

    def create_widgets(self):
        # Title Label
        title_label = ttk.Label(self.root, text="Carbon Impact Calculator", font=("Helvetica", 16))
        title_label.grid(row=0, column=0, columnspan=5, pady=10)

        # Create input fields and listboxes for each category
        for i, (category, info) in enumerate(self.inputs.items()):
            frame = ttk.LabelFrame(self.root, text=category.capitalize())
            frame.grid(row=i+1, column=0, columnspan=5, padx=10, pady=10, sticky="ew")

            for j, field in enumerate(info['fields']):
                label = ttk.Label(frame, text=field[0] + ":")
                label.grid(row=0, column=j*2, padx=5, pady=5, sticky="e")

                if len(field) == 1:
                    entry = ttk.Entry(frame, width=15)
                    entry.grid(row=0, column=j*2+1, padx=5, pady=5)
                    entry.insert(0, field[0])
                    info['fields'][j] = (field[0], entry)
                else:
                    var = tk.StringVar()
                    var.set(field[1][0])
                    menu = ttk.OptionMenu(frame, var, *field[1])
                    menu.grid(row=0, column=j*2+1, padx=5, pady=5)
                    info['fields'][j] = (field[0], var)

            button = ttk.Button(frame, text="Add " + category.capitalize(), command=lambda c=category: self.add_item(c))
            button.grid(row=0, column=len(info['fields'])*2, padx=5, pady=5)

            listbox = tk.Listbox(frame, height=5)
            listbox.grid(row=1, column=0, columnspan=len(info['fields'])*2+1, padx=5, pady=5)
            info['listbox'] = listbox

        # Calculate Button
        calculate_button = ttk.Button(self.root, text="Calculate Total Emissions", command=self.calculate_total_emissions)
        calculate_button.grid(row=len(self.inputs)+1, column=0, columnspan=5, pady=10)

        # Result Label
        self.result_label = ttk.Label(self.root, text="Total Emissions: 0.00 tonnes CO2e")
        self.result_label.grid(row=len(self.inputs)+2, column=0, columnspan=5, pady=10)

    def add_item(self, category):
        try:
            values = [f[1].get() for f in self.inputs[category]['fields']]
            self.inputs[category]['listbox'].insert(tk.END, ', '.join(values))
            for _, field in self.inputs[category]['fields']:
                if isinstance(field, ttk.Entry):
                    field.delete(0, tk.END)
        except ValueError:
            messagebox.showerror("Invalid input", "Please enter valid numbers.")

    def calculate_total_emissions(self):
        try:
            total_emissions = 0.0

            for category, info in self.inputs.items():
                for i in range(info['listbox'].size()):
                    values = info['listbox'].get(i).split(', ')
                    if category == 'devices':
                        device_type, hours_per_week, years = values
                        hours_per_year = float(hours_per_week) * WEEKS_IN_YEAR
                        usage_emissions = (hours_per_year / HOURS_IN_YEAR) * self.emission_factors['devices'][device_type]['usage']
                        embodied_emissions = self.emission_factors['devices'][device_type]['embodied'] / float(years)
                        total_emissions += usage_emissions + embodied_emissions
                    elif category == 'travel':
                        travel_mode, distance_km = values
                        distance_miles = float(distance_km) * KM_TO_MILES
                        miles_per_year = distance_miles * WEEKS_IN_YEAR
                        travel_emissions = miles_per_year * self.emission_factors['travel'][travel_mode]
                        total_emissions += travel_emissions
                    elif category == 'emails':
                        simple_emails_per_week, attachment_emails_per_week = values
                        simple_emails_per_year = float(simple_emails_per_week) * WEEKS_IN_YEAR
                        attachment_emails_per_year = float(attachment_emails_per_week) * WEEKS_IN_YEAR
                        email_emissions = (simple_emails_per_year * self.emission_factors['emails']['simple']) + \
                                          (attachment_emails_per_year * self.emission_factors['emails']['attachment'])
                        total_emissions += email_emissions

            self.result_label.config(text=f"Total Emissions: {total_emissions / 1000:.2f} tonnes CO2e")  # converting kgCO2e to tonnes
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred while calculating emissions: {e}")

# Create the main window
if __name__ == "__main__":
    root = tk.Tk()
    app = CarbonImpactCalculator(root)
    root.mainloop()