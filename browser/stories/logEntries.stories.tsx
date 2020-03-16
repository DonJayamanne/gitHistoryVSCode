import * as React from 'react';
import { Author } from '../src/components/LogView/Commit/Author';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

storiesOf('Log Entries', module)
    .add(
        'Author',
        () => (
            <Author
                selectAuthor={action('select author')}
                locale="en"
                result={{ date: new Date(), email: 'email@email.email', name: 'Author Name' }}
            ></Author>
        ),
        {
            info: { inline: true },
        },
    )
    .add(
        'with some emoji',
        () => (
            <div>
                <span role="img" aria-label="so cool">
                    😀 😎 👍 💯
                </span>
            </div>
        ),
        { info: { inline: true } },
    );
