
const nock = require('nock')
const { pick, prop } = require('ramda')

const daemon = require('../src/daemon')

describe('Daemon Queue Action', () => {
  it('Should get data from queue', (done) => {
    const data_from_queue = {
      data: {
        Type: 'Notification',
        MessageId: 'd2dc0997-18da-5063-af6b-5cb983f2c162',
        TopicArn: 'arn:aws:sns:eu-west-1:493895717736:test-inbox',
        Subject: 'PENDING',
        Message:
          '{"id":1, "user":{"email": "test@mail.it"},"test":"tt","type":"ATTIVA"}',
        Timestamp: '2019-04-15T14:44:56.224Z',
        SignatureVersion: '1',
        Signature:
          'OqwLsauADDAIzJQKhzgnVvQojqlBNiX4/+V/TDXN5o9FXhfXwA25E/1M9Yx9dX0Y9IJyafPfDEItct3JTk8X8DI+N1X0/jhjxbh4m4Vyk/cW69g4NQCI6+FXczwZAKPU28M+EElsWbuTgjM7kE4M9q1leWg9lEdE31bKPTya1U4z3CsfGpupoN2Sue7u6VwBMsa9tQoAiZmJEmllLfjYtDpQzE30Z3zl7VNvhMecOcaWkYquROT7KXep6gkpbHI3WlerAceCT5TY4tM84zXX7wywLalx9KOuShJ3mG1/8EA6h8qOb6w1B8jEeg0Wyz9kKEWMg665VX0jD/Bqknxz1Q==',
        SigningCertURL:
          'https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-6aad65c2f9911b05cd53efda11f913f9.pem',
        UnsubscribeURL:
          'https://sns.eu-west-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-1:493895717736:test-inbox:4f787beb-2891-4c17-b1f1-ca744a6e62de',
        MessageAttributes: {
          subject: { Type: 'String', Value: 'image_upload' }
        }
      },
      ReceiptHandle:
        'AQEBxFYlOOLgkS40LjnEhK7o9UTZTfuXmoCq298WkL04PecATBzIqKpHk1MbXsVSUOGrrYgtP2u1vdDayWfvS8eiwo7DsCqKAxrBsMeqRjrvRfOOE2fuIxHLwzJsjUas+JUJf9izDpsF+pZvPfhkeufGjct5GDjt6pYVd7n4sYIgvjB1GmVyeOqqj688UZvf7whWJeyqM5+s94SwuwU3DwGu77SA9IGoWXPBTMqWoFB6A5QDz7eexr1lzM7j0BLWlpaSTOhrinB+0Fmjn3kWWALdzyGH4D8qy1nLZiz+jT+xUv9uKnE1PEkN+mT2QhUS89pB/hQuO3jeCrIQvi0N0LqI6Q1JxFG32GtMy3eytHgR66nHJMNCDdVLhL71VogehZa/'
    }
    daemon.parse_got_from_queue(data_from_queue).then(data => {
      expect(data).toEqual(
        {
          receiptHandle: 'AQEBxFYlOOLgkS40LjnEhK7o9UTZTfuXmoCq298WkL04PecATBzIqKpHk1MbXsVSUOGrrYgtP2u1vdDayWfvS8eiwo7DsCqKAxrBsMeqRjrvRfOOE2fuIxHLwzJsjUas+JUJf9izDpsF+pZvPfhkeufGjct5GDjt6pYVd7n4sYIgvjB1GmVyeOqqj688UZvf7whWJeyqM5+s94SwuwU3DwGu77SA9IGoWXPBTMqWoFB6A5QDz7eexr1lzM7j0BLWlpaSTOhrinB+0Fmjn3kWWALdzyGH4D8qy1nLZiz+jT+xUv9uKnE1PEkN+mT2QhUS89pB/hQuO3jeCrIQvi0N0LqI6Q1JxFG32GtMy3eytHgR66nHJMNCDdVLhL71VogehZa/',
          Subject: 'image_upload',
          parsed_message: { id: 1, user: { email: 'test@mail.it' }, test: 'tt', type: 'ATTIVA' }
        }
      )
      done()
    })
  })
})