import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  SessionCardComponent,
  CountdownComponent,
  VoteTallyComponent,
  AvatarComponent,
  PresenceIndicatorComponent,
  EmptyStateComponent,
} from '@components';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    SessionCardComponent,
    CountdownComponent,
    VoteTallyComponent,
    AvatarComponent,
    PresenceIndicatorComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gallery" data-testid="components-gallery">
      <h1>Component Gallery</h1>

      <section>
        <h2>Buttons</h2>
        <qq-button variant="filled">Filled</qq-button>
        <qq-button variant="tonal">Tonal</qq-button>
        <qq-button variant="outlined">Outlined</qq-button>
        <qq-button variant="text">Text</qq-button>
      </section>

      <section>
        <h2>Card</h2>
        <qq-card><p style="padding: 16px">Card content</p></qq-card>
      </section>

      <section>
        <h2>Session Card</h2>
        <qq-session-card title="Team Lunch" status="voting">
          <span slot="actions">Actions here</span>
        </qq-session-card>
      </section>

      <section>
        <h2>Countdown</h2>
        <qq-countdown [deadline]="futureDate" />
      </section>

      <section>
        <h2>Vote Tally</h2>
        <qq-vote-tally [votes]="tallySample" />
      </section>

      <section>
        <h2>Avatar</h2>
        <qq-avatar name="Alice Smith" size="md" />
        <qq-presence-indicator [online]="true" />
      </section>

      <section>
        <h2>Empty State</h2>
        <qq-empty-state title="No sessions yet" description="Start a new lunch session to get going." />
      </section>
    </div>
  `,
  styles: [`
    .gallery { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
    section { display: flex; flex-direction: column; gap: 8px; }
    h2 { font-size: 1rem; margin: 0 0 8px; color: var(--mat-sys-on-surface-variant); }
  `],
})
export class GalleryComponent {
  readonly futureDate = new Date(Date.now() + 5 * 60_000);
  readonly tallySample = [
    { label: 'Sushi Place', votes: 5 },
    { label: 'Taco Bar', votes: 3 },
    { label: 'Pizza Palace', votes: 7 },
  ];
}
