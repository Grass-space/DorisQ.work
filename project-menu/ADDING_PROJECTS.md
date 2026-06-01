# Adding New Projects

This homepage is driven by `project-menu/projects.json`.

Do not edit `index.html` directly when adding, removing, or reordering homepage projects. Edit the JSON file instead.

## Main File

Edit:

```text
project-menu/projects.json
```

The important sections are:

- `categories`: the six vertical category columns.
- `colorGroups`: marker and overlay colors.
- `homeRows`: the actual homepage project order.

## Project Entry Shape

Each project lives inside a `homeRows` item:

```json
{
  "folder": "example-project",
  "side": "right",
  "title": "Example Project",
  "colorGroup": "red",
  "tags": ["creative-archival", "play"],
  "folderPath": "categories/architecture-education/example-project/"
}
```

Required fields:

- `folder`: project folder slug.
- `side`: `"left"` or `"right"` on the homepage.
- `title`: display title.
- `colorGroup`: one of the defined color groups.
- `tags`: category IDs that show as symbols in the six-column matrix.
- `folderPath`: where the project page will live from the site root.

## Color Groups

Current color groups:

```text
red
dark-blue
medium-blue
light-blue
green
light-green
```

Use the color group for the homepage/timeline marker:

```json
"colorGroup": "red"
```

and:

```json
"folderPath": "categories/architecture-education/project-folder/"
```

`folderPath` uses the broader content folder, not the visual color name:

```text
red -> categories/architecture-education/
dark-blue, medium-blue -> categories/live-build/
light-blue -> categories/curation/
green, light-green -> categories/grassspace/
```

## Tags

Current category tag IDs:

```text
creative-archival
literary-adaptation
modular-joinery
place-activation
participatory-design
play
```

These control which symbols appear in the middle six columns.

Example:

```json
"tags": ["modular-joinery", "place-activation"]
```

will show:

```text
÷ Ø
```

Empty tags are allowed:

```json
"tags": []
```

That row will show black cells only.

## Single Row

Use `type: "single"` when a project occupies one homepage row by itself.

Right-side example:

```json
{
  "id": "new-red-project",
  "type": "single",
  "projects": [
    {
      "folder": "new-red-project",
      "side": "right",
      "title": "New Red Project",
      "colorGroup": "red",
      "tags": ["creative-archival"],
      "folderPath": "categories/architecture-education/new-red-project/"
    }
  ]
}
```

Left-side example:

```json
{
  "id": "new-dark-blue-project",
  "type": "single",
  "projects": [
    {
      "folder": "new-dark-blue-project",
      "side": "left",
      "title": "New Dark Blue Project",
      "colorGroup": "dark-blue",
      "tags": ["place-activation"],
      "folderPath": "categories/live-build/new-dark-blue-project/"
    }
  ]
}
```

## Paired Row

Use `type: "paired"` when two projects share one homepage row.

Example:

```json
{
  "id": "red-blue-project-pair",
  "type": "paired",
  "projects": [
    {
      "folder": "new-red-project",
      "side": "right",
      "title": "New Red Project",
      "colorGroup": "red",
      "tags": ["creative-archival"],
      "folderPath": "categories/architecture-education/new-red-project/"
    },
    {
      "folder": "new-dark-blue-project",
      "side": "left",
      "title": "New Dark Blue Project",
      "colorGroup": "dark-blue",
      "tags": ["creative-archival"],
      "folderPath": "categories/live-build/new-dark-blue-project/"
    }
  ]
}
```

The row's middle six-column matrix combines the `tags` of both projects.

## Where To Insert New Projects

The order of `homeRows` is the homepage order from top to bottom.

### Red Only

For a new red-only project, insert a new `single` row after:

```text
6 Trades
```

and before the first red/dark-blue paired row:

```text
Living Museum + Unreel Pangkor
```

### Dark Blue Only

For a new dark-blue-only project, insert a new `single` row after:

```text
New Vernacular Ground
```

and before:

```text
Belemang Playscape
```

### Red + Dark Blue Pair

For a new red/dark-blue paired row, insert it after:

```text
Wooden Joinery + New Vernacular Ground
```

and before:

```text
Belemang Playscape
```

### Dark Blue + Light Blue Pair

If this is added in the future, insert the paired row between the dark-blue section and the light-blue section.

Currently that means around:

```text
Timber Flyship
Dog Wheelchair
```

### Light Blue + Green Pair

If this is added in the future, insert the paired row between the light-blue section and the green section.

Currently that means around:

```text
Reimagining Charcoal
Rustic Korean Bar
```

### Green Only

For a new green-only or light-green-only project, insert it inside the green section, near similar color projects.

Current green section starts at:

```text
Rustic Korean Bar
```

and ends at:

```text
Doris Q
```

## Folder And Page Creation

After adding a project to JSON, create its project folder:

```text
categories/{contentGroup}/{folder}/
```

Then create:

```text
categories/{contentGroup}/{folder}/index.html
```

Example:

```text
categories/architecture-education/new-red-project/index.html
```

## Things To Check

After editing JSON:

1. Make sure the JSON is valid.
2. Make sure every `colorGroup` exists in `colorGroups`.
3. Make sure every tag exists in `categories`.
4. Make sure `folderPath` matches the content group and `folder`.
5. Refresh the homepage and check:
   - title appears in the right order,
   - marker color is correct,
   - symbols appear in the correct columns,
   - hover title overlay has the correct color,
   - hover column shows the new project overlay.

## Common Mistakes

- Do not add old Wix URLs.
- Do not edit generated homepage rows in `index.html`.
- Do not create a separate duplicate project list below `homeRows`.
- If a title appears on the wrong side, check `side`.
- If the marker color is wrong, check `colorGroup`.
- If symbols are wrong, check `tags`.
- If clicking a project goes nowhere, check `folderPath` and whether `index.html` exists in that folder.
