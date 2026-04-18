## Tables for Structured Data

Convert any list of features, pricing tiers, schedules, service descriptions, etc., into HTML tables with Tailwind styling. Tables improve scannability and make complex information easier to digest.

### Table Template

Wrap every table in a responsive container:

```html
<div class="overflow-x-auto my-8">
  <table class="w-full table-auto border-collapse border border-sacred-sand rounded-3xl shadow-airbnb">
    <thead>
      <tr>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Column 1</th>
        <th class="bg-sacred-sand text-left p-4 font-semibold">Column 2</th>
        <!-- add more columns as needed -->
      </tr>
    </thead>
    <tbody>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand">Row 1, Cell 1</td>
        <td class="p-4 border-t border-sacred-sand">Row 1, Cell 2</td>
      </tr>
      <tr class="even:bg-sacred-sand">
        <td class="p-4 border-t border-sacred-sand">Row 2, Cell 1</td>
        <td class="p-4 border-t border-sacred-sand">Row 2, Cell 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Key details:**

- `overflow-x-auto` ensures the table scrolls on small screens.
- `border-collapse border border-sacred-sand rounded-3xl shadow-airbnb` gives a clean, bordered look.
- `bg-sacred-sand` for header background, `font-semibold` for header text.
- `even:bg-sacred-sand` alternates row colors for better readability.
- `p-4` provides consistent padding inside cells.
- `border-t border-sacred-sand` adds a subtle separator between rows.

### When to Use Tables

- Comparing multiple items (e.g., pricing tiers with different inclusions).
- Displaying schedules with time, activity, and description columns.
- Listing services with descriptions and costs.
- Presenting practical information (date, location, contact) in a two‑column layout.

---